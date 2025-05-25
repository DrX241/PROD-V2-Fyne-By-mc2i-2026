// Défis préconstruits pour le jeu "Read Me If You Can"
// Ces défis permettent de réduire la dépendance à l'API

// Types importés
interface QuizResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface CodeChallenge {
  id: string;
  code: string;
  language: 'python' | 'sql';
  question: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  responses: QuizResponse[];
  explanation: string;
  hint?: string;
}

export const prebuiltChallenges: Record<string, Record<string, CodeChallenge[]>> = {
  python: {
    débutant: [
      {
        id: "python-debutant-1",
        code: `def verifier_nombre_pair(n):
    if n % 2 == 0:
        return True
    else:
        return False

# Test de la fonction
print(verifier_nombre_pair(4))
print(verifier_nombre_pair(7))`,
        language: "python",
        question: "Quel est le résultat de cette fonction lorsqu'on lui passe le nombre 9 ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "True", isCorrect: false },
          { id: "b", text: "False", isCorrect: true },
          { id: "c", text: "None", isCorrect: false },
          { id: "d", text: "Une erreur sera générée", isCorrect: false }
        ],
        explanation: "La fonction vérifie si un nombre est pair en testant si le reste de la division par 2 est égal à 0. Pour le nombre 9, le reste de la division par 2 est 1, donc la fonction retourne False.",
        hint: "Rappelez-vous que l'opérateur % calcule le reste de la division. Un nombre pair a un reste de 0 quand il est divisé par 2."
      },
      {
        id: "python-debutant-2",
        code: `nombres = [1, 2, 3, 4, 5]
somme = 0

for nombre in nombres:
    if nombre % 2 == 0:
        somme += nombre

print(somme)`,
        language: "python",
        question: "Que fait ce code et quel est le résultat affiché ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "Il calcule la somme de tous les nombres et affiche 15", isCorrect: false },
          { id: "b", text: "Il calcule la somme des nombres pairs et affiche 6", isCorrect: true },
          { id: "c", text: "Il calcule la somme des nombres impairs et affiche 9", isCorrect: false },
          { id: "d", text: "Il compte le nombre de nombres pairs et affiche 2", isCorrect: false }
        ],
        explanation: "Ce code parcourt la liste [1, 2, 3, 4, 5] et ajoute à la variable 'somme' uniquement les nombres pairs (ceux divisibles par 2). Dans cette liste, les nombres pairs sont 2 et 4, donc la somme affichée est 2 + 4 = 6.",
        hint: "Regardez bien la condition dans la boucle for. Quels nombres de la liste répondent à cette condition ?"
      },
      {
        id: "python-debutant-3",
        code: `def transformer_liste(liste):
    resultat = []
    for element in liste:
        resultat.append(element * 2)
    return resultat

nombres = [1, 2, 3, 4, 5]
print(transformer_liste(nombres))`,
        language: "python",
        question: "Quel est le résultat de l'exécution de ce code ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "[1, 2, 3, 4, 5, 1, 2, 3, 4, 5]", isCorrect: false },
          { id: "b", text: "[2, 4, 6, 8, 10]", isCorrect: true },
          { id: "c", text: "[1, 4, 9, 16, 25]", isCorrect: false },
          { id: "d", text: "10", isCorrect: false }
        ],
        explanation: "La fonction 'transformer_liste' parcourt chaque élément de la liste passée en paramètre et ajoute à une nouvelle liste le double de chaque élément. Avec la liste [1, 2, 3, 4, 5], le résultat est [2, 4, 6, 8, 10].",
        hint: "La fonction multiplie chaque élément par 2 et stocke le résultat dans une nouvelle liste."
      },
      {
        id: "python-debutant-4",
        code: `def compter_voyelles(texte):
    voyelles = "aeiouy"
    compteur = 0
    
    for caractere in texte.lower():
        if caractere in voyelles:
            compteur += 1
            
    return compteur

phrase = "Bonjour le monde"
print(compter_voyelles(phrase))`,
        language: "python",
        question: "Combien de voyelles seront comptées dans la phrase 'Bonjour le monde' ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "4", isCorrect: false },
          { id: "b", text: "5", isCorrect: true },
          { id: "c", text: "6", isCorrect: false },
          { id: "d", text: "7", isCorrect: false }
        ],
        explanation: "La fonction compte le nombre de voyelles (a, e, i, o, u, y) dans le texte. Dans 'Bonjour le monde', on trouve: o, o, u, e, o, soit 5 voyelles au total.",
        hint: "Pensez à compter toutes les voyelles, y compris celles qui apparaissent plusieurs fois."
      },
      {
        id: "python-debutant-5",
        code: `def inverser_dictionnaire(dico):
    resultat = {}
    for cle, valeur in dico.items():
        resultat[valeur] = cle
    return resultat

notes = {"Alice": 85, "Bob": 92, "Charlie": 78}
print(inverser_dictionnaire(notes))`,
        language: "python",
        question: "Que fait cette fonction et quel sera le résultat affiché ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "Elle inverse l'ordre des paires clé-valeur: {'Charlie': 78, 'Bob': 92, 'Alice': 85}", isCorrect: false },
          { id: "b", text: "Elle échange les clés et les valeurs: {85: 'Alice', 92: 'Bob', 78: 'Charlie'}", isCorrect: true },
          { id: "c", text: "Elle crée un nouveau dictionnaire avec les mêmes clés: {'Alice': 'Alice', 'Bob': 'Bob', 'Charlie': 'Charlie'}", isCorrect: false },
          { id: "d", text: "Une erreur sera générée car les valeurs ne peuvent pas être des clés", isCorrect: false }
        ],
        explanation: "Cette fonction crée un nouveau dictionnaire où les valeurs du dictionnaire original deviennent les clés, et les clés deviennent les valeurs. Avec le dictionnaire notes, cela donne {85: 'Alice', 92: 'Bob', 78: 'Charlie'}.",
        hint: "Observez comment les paires clé-valeur sont traitées dans la boucle for."
      }
    ],
    intermédiaire: [
      {
        id: "python-intermediaire-1",
        code: `def filtrer_et_transformer(liste, filtre_func, transform_func):
    resultat = []
    for element in liste:
        if filtre_func(element):
            resultat.append(transform_func(element))
    return resultat

nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
resultat = filtrer_et_transformer(
    nombres,
    lambda x: x % 2 == 0,
    lambda x: x ** 2
)
print(resultat)`,
        language: "python",
        question: "Que fait ce code et quel est le résultat affiché ?",
        difficulty: "intermédiaire",
        responses: [
          { id: "a", text: "Il filtre les nombres pairs et les élève au carré: [4, 16, 36, 64, 100]", isCorrect: true },
          { id: "b", text: "Il filtre les nombres impairs et les élève au carré: [1, 9, 25, 49, 81]", isCorrect: false },
          { id: "c", text: "Il élève au carré tous les nombres puis filtre les pairs: [4, 16, 36, 64, 100]", isCorrect: false },
          { id: "d", text: "Il retourne une liste de booléens indiquant si chaque nombre est pair: [False, True, False, True, False, True, False, True, False, True]", isCorrect: false }
        ],
        explanation: "Cette fonction applique deux opérations: d'abord elle filtre les éléments de la liste selon le critère défini par filtre_func (ici, sélectionner les nombres pairs), puis elle transforme ces éléments filtrés avec transform_func (ici, élever au carré). Les nombres pairs dans la liste [1-10] sont 2, 4, 6, 8, 10, et leurs carrés sont [4, 16, 36, 64, 100].",
        hint: "Les fonctions lambda sont des fonctions anonymes. La première sélectionne les nombres dont le reste de division par 2 est 0 (les nombres pairs), et la seconde élève un nombre à la puissance 2."
      },
      {
        id: "python-intermediaire-2",
        code: `class Compteur:
    def __init__(self, valeur_initiale=0):
        self.valeur = valeur_initiale
        self.historique = [valeur_initiale]
    
    def incrementer(self, montant=1):
        self.valeur += montant
        self.historique.append(self.valeur)
    
    def decrementer(self, montant=1):
        self.valeur -= montant
        self.historique.append(self.valeur)
    
    def obtenir_moyenne(self):
        return sum(self.historique) / len(self.historique)

# Utilisation de la classe
compteur = Compteur(5)
compteur.incrementer(3)
compteur.incrementer()
compteur.decrementer(2)
print(compteur.valeur)
print(compteur.obtenir_moyenne())`,
        language: "python",
        question: "Quelles sont les valeurs affichées par ce code ?",
        difficulty: "intermédiaire",
        responses: [
          { id: "a", text: "7 et 7", isCorrect: false },
          { id: "b", text: "7 et 5.5", isCorrect: false },
          { id: "c", text: "7 et 6.25", isCorrect: true },
          { id: "d", text: "9 et 6", isCorrect: false }
        ],
        explanation: "Le compteur est initialisé à 5, puis incrémenté de 3 pour atteindre 8, puis incrémenté de 1 pour atteindre 9, et enfin décrémenté de 2 pour atteindre 7. La moyenne est calculée sur l'historique des valeurs [5, 8, 9, 7], ce qui donne (5 + 8 + 9 + 7) / 4 = 29 / 4 = 7.25.",
        hint: "Suivez l'évolution de la valeur et de l'historique à chaque opération."
      },
      {
        id: "python-intermediaire-3",
        code: `def trouver_anagrammes(mot, liste_mots):
    # Convertir le mot en minuscules et trier ses lettres
    lettres_triees = sorted(mot.lower())
    
    # Trouver les anagrammes
    anagrammes = []
    for candidat in liste_mots:
        if sorted(candidat.lower()) == lettres_triees and candidat.lower() != mot.lower():
            anagrammes.append(candidat)
    
    return anagrammes

mots = ["liste", "sable", "style", "balles", "poire", "chien", "niche", "repoi"]
print(trouver_anagrammes("liste", mots))`,
        language: "python",
        question: "Quel sera le résultat de l'exécution de ce code ?",
        difficulty: "intermédiaire",
        responses: [
          { id: "a", text: "['style']", isCorrect: true },
          { id: "b", text: "['style', 'liste']", isCorrect: false },
          { id: "c", text: "[]", isCorrect: false },
          { id: "d", text: "['style', 'sable', 'balles']", isCorrect: false }
        ],
        explanation: "Cette fonction recherche les anagrammes d'un mot dans une liste de mots. Un anagramme est un mot formé en réarrangeant les lettres d'un autre mot. Pour 'liste', le seul anagramme dans la liste donnée est 'style' car il contient exactement les mêmes lettres.",
        hint: "Un anagramme contient exactement les mêmes lettres qu'un autre mot, mais dans un ordre différent."
      },
      {
        id: "python-intermediaire-4",
        code: `import json
from collections import defaultdict

# Données d'exemple
donnees_json = '''
[
    {"nom": "Alice", "departement": "Ventes", "salaire": 48000},
    {"nom": "Bob", "departement": "Marketing", "salaire": 52000},
    {"nom": "Charlie", "departement": "Ventes", "salaire": 50000},
    {"nom": "David", "departement": "IT", "salaire": 60000},
    {"nom": "Eva", "departement": "Marketing", "salaire": 55000}
]
'''

def analyser_salaires(donnees):
    employes = json.loads(donnees)
    stats_par_departement = defaultdict(list)
    
    for employe in employes:
        stats_par_departement[employe["departement"]].append(employe["salaire"])
    
    resultats = {}
    for dept, salaires in stats_par_departement.items():
        resultats[dept] = {
            "salaire_moyen": sum(salaires) / len(salaires),
            "salaire_min": min(salaires),
            "salaire_max": max(salaires),
            "nombre_employes": len(salaires)
        }
    
    return resultats

resultat = analyser_salaires(donnees_json)
print(resultat["Ventes"]["salaire_moyen"])`,
        language: "python",
        question: "Quel est le salaire moyen du département des Ventes qui sera affiché ?",
        difficulty: "intermédiaire",
        responses: [
          { id: "a", text: "48000", isCorrect: false },
          { id: "b", text: "49000", isCorrect: true },
          { id: "c", text: "50000", isCorrect: false },
          { id: "d", text: "53000", isCorrect: false }
        ],
        explanation: "La fonction analyse un tableau JSON d'employés et calcule des statistiques par département. Pour le département des Ventes, il y a deux employés: Alice avec un salaire de 48000 et Charlie avec un salaire de 50000. Le salaire moyen est donc (48000 + 50000) / 2 = 49000.",
        hint: "Regardez les employés du département des Ventes et calculez la moyenne de leurs salaires."
      }
    ],
    avancé: [
      {
        id: "python-avance-1",
        code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

import time
import matplotlib.pyplot as plt

def mesurer_temps(func, args):
    debut = time.time()
    resultat = func(*args)
    fin = time.time()
    return resultat, fin - debut

resultats = []
temps = []

for i in range(35):
    res, t = mesurer_temps(fibonacci, (i,))
    resultats.append(res)
    temps.append(t)

plt.figure(figsize=(10, 6))
plt.plot(range(35), temps)
plt.xlabel('n')
plt.ylabel('Temps (secondes)')
plt.title('Performance de fibonacci avec @lru_cache')
plt.grid(True)
plt.show()`,
        language: "python",
        question: "Quel est le principal avantage de l'utilisation du décorateur @lru_cache dans ce code ?",
        difficulty: "avancé",
        responses: [
          { id: "a", text: "Il rend la fonction fibonacci thread-safe", isCorrect: false },
          { id: "b", text: "Il limite la profondeur de récursion pour éviter les StackOverflowError", isCorrect: false },
          { id: "c", text: "Il mémorise les résultats précédents pour éviter les calculs redondants", isCorrect: true },
          { id: "d", text: "Il parallélise automatiquement les calculs pour améliorer les performances", isCorrect: false }
        ],
        explanation: "Le décorateur @lru_cache (Least Recently Used Cache) de functools mémorise les résultats des appels précédents à la fonction. Cela permet d'éviter de recalculer plusieurs fois les mêmes valeurs de la suite de Fibonacci, ce qui est particulièrement utile pour cette fonction récursive où les mêmes sous-problèmes sont résolus de nombreuses fois. Sans cette mémorisation, le calcul de fibonacci(n) aurait une complexité exponentielle O(2^n).",
        hint: "Pensez à comment la récursion dans la fonction fibonacci génère de nombreux appels redondants. Que fait un cache dans ce contexte ?"
      },
      {
        id: "python-avance-2",
        code: `class NoeudArbre:
    def __init__(self, valeur):
        self.valeur = valeur
        self.gauche = None
        self.droite = None

def inserer(racine, valeur):
    if racine is None:
        return NoeudArbre(valeur)
    
    if valeur < racine.valeur:
        racine.gauche = inserer(racine.gauche, valeur)
    else:
        racine.droite = inserer(racine.droite, valeur)
    
    return racine

def parcours_inordre(racine, resultat=None):
    if resultat is None:
        resultat = []
    
    if racine:
        parcours_inordre(racine.gauche, resultat)
        resultat.append(racine.valeur)
        parcours_inordre(racine.droite, resultat)
    
    return resultat

# Construction de l'arbre
racine = None
for valeur in [50, 30, 70, 20, 40, 60, 80]:
    racine = inserer(racine, valeur)

print(parcours_inordre(racine))`,
        language: "python",
        question: "Quelle sera la sortie de ce code utilisant un arbre binaire de recherche ?",
        difficulty: "avancé",
        responses: [
          { id: "a", text: "[50, 30, 70, 20, 40, 60, 80]", isCorrect: false },
          { id: "b", text: "[20, 30, 40, 50, 60, 70, 80]", isCorrect: true },
          { id: "c", text: "[20, 40, 30, 60, 80, 70, 50]", isCorrect: false },
          { id: "d", text: "[80, 70, 60, 50, 40, 30, 20]", isCorrect: false }
        ],
        explanation: "Ce code implémente un arbre binaire de recherche où chaque nœud a une valeur, un sous-arbre gauche contenant des valeurs inférieures et un sous-arbre droit contenant des valeurs supérieures. La fonction parcours_inordre effectue un parcours inordre (gauche-racine-droite), ce qui, pour un arbre binaire de recherche, donne les valeurs dans l'ordre croissant. Avec les valeurs [50, 30, 70, 20, 40, 60, 80], le parcours inordre donne [20, 30, 40, 50, 60, 70, 80].",
        hint: "Un parcours inordre d'un arbre binaire de recherche visite d'abord le sous-arbre gauche, puis la racine, puis le sous-arbre droit, ce qui donne les valeurs dans l'ordre croissant."
      }
    ]
  },
  sql: {
    débutant: [
      {
        id: "sql-debutant-1",
        code: `SELECT department_id, COUNT(*) as nombre_employes
FROM employees
WHERE salary > 5000
GROUP BY department_id
HAVING COUNT(*) > 3
ORDER BY nombre_employes DESC;`,
        language: "sql",
        question: "Que fait cette requête SQL ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "Elle compte le nombre total d'employés dans chaque département", isCorrect: false },
          { id: "b", text: "Elle liste les départements où plus de 3 employés gagnent plus de 5000", isCorrect: true },
          { id: "c", text: "Elle trouve les départements ayant exactement 3 employés avec un salaire supérieur à 5000", isCorrect: false },
          { id: "d", text: "Elle calcule le salaire moyen par département pour les employés gagnant plus de 5000", isCorrect: false }
        ],
        explanation: "Cette requête SQL filtre d'abord les employés ayant un salaire supérieur à 5000, puis les groupe par département. Ensuite, elle applique un filtre HAVING pour ne garder que les groupes contenant plus de 3 employés. Enfin, elle trie les résultats par ordre décroissant du nombre d'employés.",
        hint: "Analysez les différentes clauses: WHERE filtre les lignes individuelles, GROUP BY regroupe les résultats, HAVING filtre les groupes, et ORDER BY détermine l'ordre des résultats."
      },
      {
        id: "sql-debutant-2",
        code: `SELECT c.customer_name, 
       SUM(o.total_amount) as montant_total
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.customer_name
ORDER BY montant_total DESC NULLS LAST;`,
        language: "sql",
        question: "Que fait cette requête et pourquoi utilise-t-elle un LEFT JOIN plutôt qu'un INNER JOIN ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "Elle liste le montant total des commandes par client, et inclut les clients sans commandes", isCorrect: true },
          { id: "b", text: "Elle trouve les clients qui ont dépensé le plus, en excluant ceux sans commandes", isCorrect: false },
          { id: "c", text: "Elle calcule le nombre de commandes par client, y compris pour ceux sans commandes", isCorrect: false },
          { id: "d", text: "Elle joint les tables customers et orders pour trouver les commandes sans clients", isCorrect: false }
        ],
        explanation: "Cette requête utilise un LEFT JOIN pour conserver tous les clients dans les résultats, même ceux qui n'ont pas passé de commandes. Pour ces clients sans commandes, la valeur de montant_total sera NULL. Un INNER JOIN aurait exclu les clients sans commandes des résultats. La clause NULLS LAST place les clients sans commandes à la fin du tri.",
        hint: "Un LEFT JOIN garde toutes les lignes de la table de gauche (customers) même s'il n'y a pas de correspondance dans la table de droite (orders)."
      },
      {
        id: "sql-debutant-3",
        code: `SELECT 
    p.product_name,
    p.unit_price,
    p.unit_price * 0.9 AS discounted_price,
    c.category_name
FROM 
    products p
JOIN 
    categories c ON p.category_id = c.category_id
WHERE 
    p.unit_price > 50
ORDER BY 
    discounted_price DESC;`,
        language: "sql",
        question: "Que calcule cette requête et comment les résultats sont-ils triés ?",
        difficulty: "débutant",
        responses: [
          { id: "a", text: "Elle calcule une remise de 10% sur les produits et trie par prix remisé décroissant", isCorrect: true },
          { id: "b", text: "Elle augmente le prix des produits de 10% et trie par catégorie", isCorrect: false },
          { id: "c", text: "Elle calcule une remise de 90% sur les produits et trie par prix original", isCorrect: false },
          { id: "d", text: "Elle trouve les produits avec un prix supérieur à 50 et trie par nom de produit", isCorrect: false }
        ],
        explanation: "Cette requête sélectionne les produits dont le prix unitaire est supérieur à 50, calcule un prix remisé de 90% du prix original (une remise de 10%), et trie les résultats par prix remisé décroissant. Elle joint également la table des catégories pour afficher le nom de la catégorie de chaque produit.",
        hint: "Analysez la formule utilisée pour calculer discounted_price et regardez la clause ORDER BY."
      }
    ],
    intermédiaire: [
      {
        id: "sql-intermediaire-1",
        code: `WITH ventes_mensuelles AS (
  SELECT 
    DATE_TRUNC('month', sale_date) as mois,
    product_id,
    SUM(quantity) as quantite_vendue
  FROM sales
  WHERE sale_date >= '2023-01-01' AND sale_date < '2024-01-01'
  GROUP BY DATE_TRUNC('month', sale_date), product_id
),
classement_produits AS (
  SELECT
    mois,
    product_id,
    quantite_vendue,
    RANK() OVER (PARTITION BY mois ORDER BY quantite_vendue DESC) as rang
  FROM ventes_mensuelles
)
SELECT 
  cp.mois,
  p.product_name,
  cp.quantite_vendue
FROM classement_produits cp
JOIN products p ON cp.product_id = p.product_id
WHERE cp.rang <= 3
ORDER BY cp.mois, cp.rang;`,
        language: "sql",
        question: "Que calcule cette requête SQL avec ses Common Table Expressions (CTE) ?",
        difficulty: "intermédiaire",
        responses: [
          { id: "a", text: "La quantité totale vendue pour chaque produit en 2023", isCorrect: false },
          { id: "b", text: "Les 3 produits les plus vendus de tous les temps", isCorrect: false },
          { id: "c", text: "Les 3 produits les plus vendus pour chaque mois de 2023", isCorrect: true },
          { id: "d", text: "La progression mensuelle des ventes pour chaque produit en 2023", isCorrect: false }
        ],
        explanation: "Cette requête utilise deux CTEs pour trouver les trois produits les plus vendus pour chaque mois de 2023. La première CTE (ventes_mensuelles) agrège les ventes par mois et par produit. La seconde CTE (classement_produits) utilise la fonction de fenêtrage RANK() pour attribuer un rang à chaque produit en fonction de sa quantité vendue au sein de chaque mois. La requête principale sélectionne ensuite uniquement les produits ayant un rang inférieur ou égal à 3.",
        hint: "Examinez la fonction de fenêtrage RANK() OVER (PARTITION BY...) et comment elle est utilisée avec la clause WHERE dans la requête principale."
      },
      {
        id: "sql-intermediaire-2",
        code: `WITH customer_stats AS (
  SELECT
    c.customer_id,
    c.customer_name,
    COUNT(o.order_id) AS total_orders,
    SUM(o.total_amount) AS total_spent,
    MAX(o.order_date) AS last_order_date,
    (SELECT COUNT(*) FROM order_items oi JOIN orders o2 ON oi.order_id = o2.order_id 
     WHERE o2.customer_id = c.customer_id) AS total_items
  FROM
    customers c
  LEFT JOIN
    orders o ON c.customer_id = o.customer_id
  GROUP BY
    c.customer_id, c.customer_name
),
customer_segments AS (
  SELECT
    customer_id,
    customer_name,
    total_orders,
    total_spent,
    last_order_date,
    total_items,
    CASE
      WHEN total_spent > 1000 AND total_orders > 10 THEN 'VIP'
      WHEN total_spent > 500 OR total_orders > 5 THEN 'Régulier'
      ELSE 'Occasionnel'
    END AS segment,
    NTILE(4) OVER (ORDER BY total_spent DESC) AS quartile
  FROM
    customer_stats
)
SELECT
  segment,
  COUNT(*) AS nombre_clients,
  ROUND(AVG(total_spent), 2) AS depense_moyenne,
  ROUND(AVG(total_orders), 2) AS commandes_moyennes
FROM
  customer_segments
GROUP BY
  segment
ORDER BY
  depense_moyenne DESC;`,
        language: "sql",
        question: "Quel est l'objectif principal de cette requête SQL complexe ?",
        difficulty: "intermédiaire",
        responses: [
          { id: "a", text: "Calculer les ventes totales par période", isCorrect: false },
          { id: "b", text: "Segmenter les clients et analyser leur comportement d'achat par segment", isCorrect: true },
          { id: "c", text: "Trouver les produits les plus populaires par catégorie de clients", isCorrect: false },
          { id: "d", text: "Identifier les clients inactifs depuis une certaine période", isCorrect: false }
        ],
        explanation: "Cette requête SQL complexe effectue une analyse de segmentation des clients. Elle commence par calculer des statistiques par client (nombre de commandes, montant total dépensé, date de dernière commande, etc.), puis classe chaque client dans un segment ('VIP', 'Régulier' ou 'Occasionnel') en fonction de critères spécifiques. Enfin, elle agrège les données par segment pour obtenir le nombre de clients, la dépense moyenne et le nombre moyen de commandes pour chaque segment.",
        hint: "Regardez la clause CASE dans la CTE customer_segments et comment les résultats sont agrégés dans la requête finale."
      }
    ],
    avancé: [
      {
        id: "sql-avance-1",
        code: `WITH RECURSIVE employee_hierarchy AS (
  -- Cas de base: employés de niveau supérieur (sans manager)
  SELECT 
    employee_id, 
    first_name, 
    last_name, 
    manager_id, 
    1 as depth,
    ARRAY[employee_id] as path,
    first_name || ' ' || last_name as full_path_names
  FROM employees
  WHERE manager_id IS NULL
  
  UNION ALL
  
  -- Cas récursif: tous les subordonnés directs
  SELECT 
    e.employee_id, 
    e.first_name, 
    e.last_name, 
    e.manager_id, 
    eh.depth + 1,
    eh.path || e.employee_id,
    eh.full_path_names || ' > ' || e.first_name || ' ' || e.last_name
  FROM employees e
  JOIN employee_hierarchy eh ON e.manager_id = eh.employee_id
  WHERE NOT e.employee_id = ANY(eh.path)  -- Évite les cycles
)
SELECT 
  eh.employee_id,
  eh.first_name,
  eh.last_name,
  eh.depth,
  eh.full_path_names,
  (SELECT COUNT(*) FROM employees WHERE manager_id = eh.employee_id) as direct_reports
FROM employee_hierarchy eh
ORDER BY eh.path;`,
        language: "sql",
        question: "Quel problème potentiel cette requête SQL cherche-t-elle à éviter avec la condition 'WHERE NOT e.employee_id = ANY(eh.path)' ?",
        difficulty: "avancé",
        responses: [
          { id: "a", text: "Les erreurs de performance dues à des jointures trop volumineuses", isCorrect: false },
          { id: "b", text: "L'inclusion d'employés qui ne font pas partie de la hiérarchie", isCorrect: false },
          { id: "c", text: "Les boucles infinies dues à des références circulaires dans la hiérarchie", isCorrect: true },
          { id: "d", text: "La duplication d'employés dans les résultats finaux", isCorrect: false }
        ],
        explanation: "Cette requête utilise une CTE récursive pour construire une hiérarchie complète des employés. La condition 'WHERE NOT e.employee_id = ANY(eh.path)' vérifie qu'un employé n'apparaît pas déjà dans le chemin hiérarchique actuel, ce qui pourrait arriver si les données contiennent une référence circulaire (par exemple, A est manager de B, B est manager de C, et C est manager de A). Sans cette vérification, la requête récursive pourrait entrer dans une boucle infinie et ne jamais se terminer.",
        hint: "Pensez à ce qui pourrait se passer dans une structure hiérarchique si un subordonné était enregistré comme le manager de son propre manager. Comment la récursion se comporterait-elle sans cette protection ?"
      },
      {
        id: "sql-avance-2",
        code: `WITH monthly_sales AS (
  SELECT
    DATE_TRUNC('month', order_date) AS month,
    SUM(total_amount) AS monthly_revenue
  FROM orders
  WHERE order_date >= '2022-01-01' AND order_date < '2024-01-01'
  GROUP BY DATE_TRUNC('month', order_date)
),
sales_stats AS (
  SELECT
    month,
    monthly_revenue,
    LAG(monthly_revenue, 1) OVER (ORDER BY month) AS prev_month_revenue,
    LAG(monthly_revenue, 12) OVER (ORDER BY month) AS prev_year_revenue,
    AVG(monthly_revenue) OVER (
      ORDER BY month
      ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS rolling_avg_3_months
  FROM monthly_sales
)
SELECT
  month,
  monthly_revenue,
  CASE 
    WHEN prev_month_revenue IS NULL THEN NULL
    ELSE ROUND((monthly_revenue - prev_month_revenue) / prev_month_revenue * 100, 2)
  END AS month_over_month_percent,
  CASE 
    WHEN prev_year_revenue IS NULL THEN NULL
    ELSE ROUND((monthly_revenue - prev_year_revenue) / prev_year_revenue * 100, 2)
  END AS year_over_year_percent,
  rolling_avg_3_months
FROM sales_stats
WHERE month >= '2023-01-01'
ORDER BY month;`,
        language: "sql",
        question: "Quelles métriques cette requête SQL calcule-t-elle pour analyser les tendances de vente ?",
        difficulty: "avancé",
        responses: [
          { id: "a", text: "Uniquement le chiffre d'affaires mensuel", isCorrect: false },
          { id: "b", text: "Le chiffre d'affaires mensuel et le taux de croissance mois par mois", isCorrect: false },
          { id: "c", text: "La moyenne mobile sur 3 mois et la croissance par rapport à l'année précédente", isCorrect: false },
          { id: "d", text: "Le chiffre d'affaires mensuel, la variation en pourcentage mois/mois et année/année, et la moyenne mobile sur 3 mois", isCorrect: true }
        ],
        explanation: "Cette requête SQL avancée calcule plusieurs métriques d'analyse des ventes pour l'année 2023: 1) Le chiffre d'affaires mensuel, 2) Le pourcentage de variation par rapport au mois précédent, 3) Le pourcentage de variation par rapport au même mois de l'année précédente, et 4) Une moyenne mobile sur 3 mois. Elle utilise les fonctions de fenêtrage LAG pour accéder aux valeurs des périodes précédentes et AVG avec une clause ROWS BETWEEN pour calculer la moyenne mobile.",
        hint: "Examinez les fonctions LAG et comment elles sont utilisées dans les calculs de pourcentage. Notez également la fonction AVG avec la clause ROWS BETWEEN."
      }
    ]
  }
};

// Fonction pour générer un identifiant unique basé sur le timestamp
export const generateUniqueId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Fonction pour obtenir des défis aléatoires préconstruits
export const getRandomPrebuiltChallenges = (
  language: 'python' | 'sql',
  difficulty: 'débutant' | 'intermédiaire' | 'avancé',
  count: number = 3
): CodeChallenge[] => {
  const challenges = prebuiltChallenges[language][difficulty];
  
  // Si pas assez de défis disponibles, retourner tous ceux disponibles
  if (challenges.length <= count) {
    return [...challenges];
  }
  
  // Sinon, sélectionner aléatoirement 'count' défis
  const shuffled = [...challenges].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Fonction pour récupérer un défi par ID
export const getChallengeById = (id: string): CodeChallenge | null => {
  for (const language of Object.keys(prebuiltChallenges) as Array<keyof typeof prebuiltChallenges>) {
    for (const difficulty of Object.keys(prebuiltChallenges[language]) as Array<keyof typeof prebuiltChallenges[language]>) {
      const challenge = prebuiltChallenges[language][difficulty].find(c => c.id === id);
      if (challenge) {
        return challenge;
      }
    }
  }
  return null;
};