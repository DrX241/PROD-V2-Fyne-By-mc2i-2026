import React from 'react';
import { ChevronRight, ChevronLeft, BrainCircuit, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface StructuresControleProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const StructuresControle: React.FC<StructuresControleProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Structures de contrôle</h2>
      
      <div className="mb-6">
        <p className="mb-4">Les structures de contrôle vous permettent d'exécuter certaines parties de code conditionnellement, d'effectuer des itérations, et de créer des flux logiques dans vos programmes. Ces concepts sont fondamentaux pour l'écriture d'algorithmes en data science.</p>
        
        <h3 className="text-xl font-semibold mb-3">Instructions conditionnelles</h3>
        <p className="mb-3">Les instructions conditionnelles vous permettent d'exécuter différentes sections de code en fonction de conditions spécifiques.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">if, elif, else</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Structure de base
age = 25

if age < 18:
    print("Mineur")
elif age < 65:
    print("Adulte en âge de travailler")
else:
    print("Senior")
    
# Conditions multiples
revenu = 50000
experience = 3

if revenu > 60000 or experience > 5:
    print("Candidat qualifié pour le poste senior")
elif revenu > 40000 and experience > 2:
    print("Candidat qualifié pour le poste intermédiaire")
else:
    print("Candidat qualifié pour le poste junior")
    
# Opérateur ternaire (expression conditionnelle)
statut = "Expérimenté" if experience > 5 else "Débutant"
print(statut)  # Débutant

# Conditions imbriquées
if age >= 18:
    if revenu > 30000:
        print("Adulte financièrement stable")
    else:
        print("Adulte avec revenus limités")
else:
    print("Mineur")`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-2">Vérité en Python</h4>
          <p className="mb-2">En Python, les valeurs suivantes sont considérées comme <code>False</code> :</p>
          <ul className="list-disc list-inside space-y-1 text-blue-200">
            <li><code>False</code> (booléen)</li>
            <li><code>None</code></li>
            <li>Zéro de tout type numérique (<code>0</code>, <code>0.0</code>)</li>
            <li>Séquences et collections vides (<code>""</code>, <code>[]</code>, <code>()</code>, <code>{}</code>)</li>
          </ul>
          <p className="mt-2 mb-2">Tout le reste est considéré comme <code>True</code>.</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
            {`# Exemples
valeurs = [0, 0.0, "", [], {}, None, False, True, 1, "texte", [1, 2], (1, 2)]

for val in valeurs:
    if val:
        resultat = "True"
    else:
        resultat = "False"
    print(f"{val}: {resultat}")

# Résultat:
# 0: False
# 0.0: False
# : False
# []: False
# {}: False
# None: False
# False: False
# True: True
# 1: True
# texte: True
# [1, 2]: True
# (1, 2): True`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Boucles</h3>
        <p className="mb-3">Les boucles permettent d'exécuter un bloc de code plusieurs fois. Python a deux types de boucles principales : <code>for</code> et <code>while</code>.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Boucle for</h4>
          <p className="mb-2">La boucle <code>for</code> est utilisée pour itérer sur une séquence (liste, tuple, dictionnaire, ensemble, chaîne) ou tout autre objet itérable.</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`# Itération sur une liste
langages = ["Python", "R", "SQL", "Java"]
for langage in langages:
    print(f"J'apprends {langage}")
    
# Itération sur une chaîne
for lettre in "Python":
    print(lettre)
    
# Itération avec range()
for i in range(5):  # 0, 1, 2, 3, 4
    print(i)
    
for i in range(2, 8):  # 2, 3, 4, 5, 6, 7
    print(i)
    
for i in range(0, 10, 2):  # 0, 2, 4, 6, 8 (pas de 2)
    print(i)
    
# Énumération (pour avoir l'index et la valeur)
for i, langage in enumerate(langages):
    print(f"{i+1}. {langage}")
    
# Itération sur un dictionnaire
utilisateur = {"nom": "Alice", "age": 30, "ville": "Paris"}

# Parcourir les clés (par défaut)
for cle in utilisateur:
    print(cle)
    
# Parcourir les valeurs
for valeur in utilisateur.values():
    print(valeur)
    
# Parcourir les paires clé-valeur
for cle, valeur in utilisateur.items():
    print(f"{cle}: {valeur}")`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Boucle while</h4>
          <p className="mb-2">La boucle <code>while</code> exécute un bloc de code tant qu'une condition est vraie.</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Boucle while de base
compteur = 0
while compteur < 5:
    print(compteur)
    compteur += 1
    
# Utilisation de break pour sortir d'une boucle
nombre = 0
while True:
    nombre += 1
    if nombre > 10:
        break  # Sort de la boucle
    if nombre % 2 == 0:
        continue  # Passe à l'itération suivante
    print(nombre)  # Affiche uniquement les nombres impairs
    
# Boucle avec else (exécuté quand la condition devient False)
i = 0
while i < 5:
    print(i)
    i += 1
else:
    print("Boucle terminée normalement")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Instructions de contrôle de boucle</h3>
        <p className="mb-3">Python fournit des instructions qui modifient le comportement des boucles :</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# break : sort complètement de la boucle
for i in range(10):
    if i == 5:
        break
    print(i)  # Affiche 0, 1, 2, 3, 4

# continue : passe à l'itération suivante
for i in range(10):
    if i % 2 == 0:
        continue
    print(i)  # Affiche uniquement les nombres impairs: 1, 3, 5, 7, 9

# else avec des boucles (exécuté seulement si la boucle se termine normalement, sans break)
for i in range(5):
    print(i)
else:
    print("Boucle terminée sans break")

for i in range(5):
    if i == 3:
        break
    print(i)
else:
    print("Ce message ne sera pas affiché car break a été utilisé")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Compréhensions de liste, dictionnaire et ensemble</h3>
        <p className="mb-3">Les compréhensions fournissent une syntaxe concise pour créer des listes, des dictionnaires et des ensembles à partir de séquences existantes.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Compréhensions de liste</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`# Format de base
# [expression for item in iterable if condition]

# Exemple simple : liste des carrés
carres = [x**2 for x in range(1, 6)]
print(carres)  # [1, 4, 9, 16, 25]

# Avec condition
nombres_pairs = [x for x in range(1, 11) if x % 2 == 0]
print(nombres_pairs)  # [2, 4, 6, 8, 10]

# Expressions plus complexes
phrases = [f"{x} au carré vaut {x**2}" for x in range(1, 6)]
print(phrases)  # ['1 au carré vaut 1', '2 au carré vaut 4', ...]

# Aplatir une liste de listes
liste_de_listes = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
aplatie = [x for sous_liste in liste_de_listes for x in sous_liste]
print(aplatie)  # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Filtrage de données
donnees = [
    {"nom": "Alice", "age": 25, "actif": True},
    {"nom": "Bob", "age": 30, "actif": False},
    {"nom": "Charlie", "age": 35, "actif": True},
]
utilisateurs_actifs = [user["nom"] for user in donnees if user["actif"]]
print(utilisateurs_actifs)  # ['Alice', 'Charlie']`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Compréhensions de dictionnaire</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`# Format de base
# {key_expr: value_expr for item in iterable if condition}

# Exemple simple : dictionnaire des carrés
carres_dict = {x: x**2 for x in range(1, 6)}
print(carres_dict)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Avec condition
pairs_dict = {x: x**2 for x in range(1, 11) if x % 2 == 0}
print(pairs_dict)  # {2: 4, 4: 16, 6: 36, 8: 64, 10: 100}

# Conversion de dictionnaire
prices = {"pomme": 0.5, "banane": 0.25, "orange": 0.75}
euros_to_dollars = {fruit: price * 1.1 for fruit, price in prices.items()}
print(euros_to_dollars)  # {'pomme': 0.55, 'banane': 0.275, 'orange': 0.825}

# Filtrage de dictionnaire
stock = {"pomme": 50, "banane": 0, "orange": 20, "kiwi": 0}
en_stock = {item: qte for item, qte in stock.items() if qte > 0}
print(en_stock)  # {'pomme': 50, 'orange': 20}`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Compréhensions d'ensemble</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Format de base
# {expression for item in iterable if condition}

# Exemple simple : ensemble des carrés
carres_set = {x**2 for x in range(1, 6)}
print(carres_set)  # {1, 4, 9, 16, 25}

# Avec condition
pairs_set = {x for x in range(1, 11) if x % 2 == 0}
print(pairs_set)  # {2, 4, 6, 8, 10}

# Application pratique : trouver les caractères uniques
texte = "python est un langage polyvalent"
caracteres_uniques = {char for char in texte if char.isalpha()}
print(caracteres_uniques)  # {'a', 'e', 'g', 'h', 'l', 'n', 'o', 'p', 's', 't', 'v', 'y'}`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Gestion des exceptions</h3>
        <p className="mb-3">La gestion des exceptions permet de gérer les erreurs de façon élégante et de maintenir l'exécution du programme.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Structure de base</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`# Structure try-except
try:
    x = 10 / 0  # Division par zéro génère une erreur
except ZeroDivisionError:
    print("Division par zéro impossible")
    
# Plusieurs clauses except
try:
    nombre = int(input("Entrez un nombre: "))
    resultat = 10 / nombre
except ValueError:
    print("Entrée invalide. Veuillez entrer un nombre.")
except ZeroDivisionError:
    print("Division par zéro impossible.")
    
# Clause except générique (à utiliser avec précaution)
try:
    with open("fichier_inexistant.txt", "r") as fichier:
        contenu = fichier.read()
except Exception as e:
    print(f"Une erreur s'est produite: {e}")
    
# Clauses else et finally
try:
    nombre = int(input("Entrez un nombre: "))
    resultat = 10 / nombre
except ValueError:
    print("Entrée invalide. Veuillez entrer un nombre.")
except ZeroDivisionError:
    print("Division par zéro impossible.")
else:
    # Exécuté si aucune exception n'est levée
    print(f"Le résultat est {resultat}")
finally:
    # Toujours exécuté, qu'il y ait une exception ou non
    print("Opération terminée.")`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Lever des exceptions</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Lever une exception avec raise
def diviser(a, b):
    if b == 0:
        raise ValueError("Division par zéro impossible")
    return a / b

try:
    resultat = diviser(10, 0)
except ValueError as e:
    print(e)  # Division par zéro impossible
    
# Assertions (pour le débogage et les tests)
def calculer_racine_carree(nombre):
    assert nombre >= 0, "Nombre négatif non autorisé"
    return nombre ** 0.5

try:
    print(calculer_racine_carree(-1))
except AssertionError as e:
    print(e)  # Nombre négatif non autorisé`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
            Application en Data Science
          </h3>
          <p className="text-blue-200 mb-3">Voici un exemple qui combine plusieurs structures de contrôle pour résoudre un problème typique en data science :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Analyse et filtrage d'un dataset sur les revenus

# Données fictives
donnees = [
    {"id": 1, "nom": "Alice", "age": 28, "revenu": 45000, "secteur": "Tech"},
    {"id": 2, "nom": "Bob", "age": 35, "revenu": 60000, "secteur": "Finance"},
    {"id": 3, "nom": "Charlie", "age": 22, "revenu": 32000, "secteur": "Retail"},
    {"id": 4, "nom": "David", "age": 42, "revenu": 75000, "secteur": "Tech"},
    {"id": 5, "nom": "Eve", "age": 31, "revenu": 55000, "secteur": "Santé"},
    {"id": 6, "nom": "Frank", "age": 48, "revenu": None, "secteur": "Education"},
    {"id": 7, "nom": "Grace", "age": 39, "revenu": 62000, "secteur": "Finance"}
]

# 1. Filtrage des données valides et calcul des statistiques par secteur
stats_par_secteur = {}

for personne in donnees:
    # Gestion des valeurs manquantes
    if personne["revenu"] is None:
        print(f"Donnée ignorée: {personne['nom']} a un revenu non spécifié")
        continue
    
    secteur = personne["secteur"]
    revenu = personne["revenu"]
    
    # Initialisation du dictionnaire pour un nouveau secteur
    if secteur not in stats_par_secteur:
        stats_par_secteur[secteur] = {
            "count": 0,
            "total_revenu": 0,
            "min_revenu": float('inf'),
            "max_revenu": float('-inf'),
            "personnes": []
        }
    
    # Mise à jour des statistiques
    stats = stats_par_secteur[secteur]
    stats["count"] += 1
    stats["total_revenu"] += revenu
    stats["min_revenu"] = min(stats["min_revenu"], revenu)
    stats["max_revenu"] = max(stats["max_revenu"], revenu)
    stats["personnes"].append(personne["nom"])

# 2. Calcul des moyennes et affichage des résultats
print("\\nAnalyse des revenus par secteur:")
print("-" * 50)

for secteur, stats in stats_par_secteur.items():
    try:
        revenu_moyen = stats["total_revenu"] / stats["count"]
        # Formatage du résultat avec les f-strings
        print(f"Secteur: {secteur}")
        print(f"  Nombre de personnes: {stats['count']}")
        print(f"  Revenu moyen: {revenu_moyen:.2f}€")
        print(f"  Revenu min: {stats['min_revenu']}€")
        print(f"  Revenu max: {stats['max_revenu']}€")
        print(f"  Personnes: {', '.join(stats['personnes'])}")
        print()
    except ZeroDivisionError:
        print(f"Secteur {secteur}: Pas de données valides pour calculer la moyenne")

# 3. Identification des secteurs à haut revenu (compréhension de dictionnaire)
secteurs_haut_revenu = {
    secteur: stats for secteur, stats in stats_par_secteur.items()
    if stats["total_revenu"] / stats["count"] > 50000
}

print("\\nSecteurs à haut revenu:")
print("-" * 50)
for secteur in secteurs_haut_revenu:
    print(f"- {secteur}")

# 4. Recherche de la personne avec le revenu le plus élevé
try:
    personne_max_revenu = max(
        [p for p in donnees if p["revenu"] is not None],
        key=lambda x: x["revenu"]
    )
    print(f"\\nPersonne avec le revenu le plus élevé: {personne_max_revenu['nom']} ({personne_max_revenu['revenu']}€)")
except ValueError:
    print("\\nImpossible de déterminer la personne avec le revenu le plus élevé")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Analyse des notes d'étudiants</h4>
          <p className="mb-2">Écrivez un programme qui analyse une liste de notes et affiche la moyenne, le nombre d'étudiants ayant réussi (note supérieure ou égale à 60) et échoué.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def analyser_notes(notes):
    try:
        if not notes:
            raise ValueError("La liste de notes est vide")
            
        # Calcul de la moyenne
        moyenne = sum(notes) / len(notes)
        
        # Comptage des réussites/échecs
        reussite = sum(1 for note in notes if note >= 60)
        echec = len(notes) - reussite
        
        # Calcul du pourcentage de réussite
        pourcentage_reussite = (reussite / len(notes)) * 100
        
        # Détermination de la note maximale et minimale
        note_max = max(notes)
        note_min = min(notes)
        
        # Affichage des résultats
        print(f"Résultats de l'analyse:")
        print(f"- Nombre d'étudiants: {len(notes)}")
        print(f"- Moyenne de la classe: {moyenne:.1f}")
        print(f"- Note la plus haute: {note_max}")
        print(f"- Note la plus basse: {note_min}")
        print(f"- Nombre d'étudiants ayant réussi: {reussite} ({pourcentage_reussite:.1f}%)")
        print(f"- Nombre d'étudiants ayant échoué: {echec}")
        
    except ValueError as e:
        print(f"Erreur: {e}")
    except Exception as e:
        print(f"Une erreur inattendue s'est produite: {e}")

# Test avec des données
notes_etudiants = [85, 90, 45, 72, 58, 63, 77, 95, 55, 60]
analyser_notes(notes_etudiants)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Analyseur de fichier CSV</h4>
          <p className="mb-2">Écrivez un programme qui lit un fichier CSV hypothétique contenant des données de vente et effectue une analyse de base.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def analyser_ventes(nom_fichier):
    try:
        # Dans un cas réel, vous utiliseriez la ligne suivante:
        # with open(nom_fichier, 'r') as file:
        #     lignes = file.readlines()
        
        # Simulation du contenu du fichier pour l'exemple
        lignes = [
            "Date,Produit,Categorie,Prix,Quantite\\n",
            "2023-01-15,Ordinateur,Electronique,1200,2\\n",
            "2023-01-16,Souris,Electronique,25,10\\n",
            "2023-01-16,Bureau,Mobilier,350,1\\n",
            "2023-01-17,Clavier,Electronique,80,5\\n",
            "2023-01-18,Chaise,Mobilier,120,3\\n",
            "2023-01-19,Moniteur,Electronique,200,2\\n"
        ]
        
        # Traitement des données
        en_tete = lignes[0].strip().split(',')
        donnees = []
        
        for i in range(1, len(lignes)):
            ligne = lignes[i].strip().split(',')
            if len(ligne) == len(en_tete):
                # Création d'un dictionnaire pour chaque ligne
                donnees.append({
                    en_tete[0]: ligne[0],
                    en_tete[1]: ligne[1],
                    en_tete[2]: ligne[2],
                    en_tete[3]: float(ligne[3]),
                    en_tete[4]: int(ligne[4])
                })
        
        # Analyse par catégorie
        ventes_par_categorie = {}
        for vente in donnees:
            categorie = vente["Categorie"]
            montant = vente["Prix"] * vente["Quantite"]
            
            if categorie in ventes_par_categorie:
                ventes_par_categorie[categorie]["total"] += montant
                ventes_par_categorie[categorie]["quantite"] += vente["Quantite"]
                ventes_par_categorie[categorie]["produits"].add(vente["Produit"])
            else:
                ventes_par_categorie[categorie] = {
                    "total": montant,
                    "quantite": vente["Quantite"],
                    "produits": {vente["Produit"]}
                }
        
        # Calcul du total global
        total_global = sum(item["Prix"] * item["Quantite"] for item in donnees)
        
        # Affichage des résultats
        print(f"Analyse des ventes dans le fichier {nom_fichier}:")
        print(f"Nombre total de transactions: {len(donnees)}")
        print(f"Montant total des ventes: {total_global}€")
        print("\\nVentes par catégorie:")
        
        for categorie, stats in ventes_par_categorie.items():
            print(f"- {categorie}:")
            print(f"  * Montant total: {stats['total']}€")
            print(f"  * Quantité vendue: {stats['quantite']} unités")
            print(f"  * Produits vendus: {', '.join(stats['produits'])}")
            print(f"  * Pourcentage du total: {(stats['total'] / total_global) * 100:.1f}%")
        
        # Produit le plus vendu (en quantité)
        produit_plus_vendu = max(donnees, key=lambda x: x["Quantite"])
        print(f"\\nProduit le plus vendu (en quantité): {produit_plus_vendu['Produit']} ({produit_plus_vendu['Quantite']} unités)")
        
        # Vente la plus importante (en valeur)
        vente_plus_importante = max(donnees, key=lambda x: x["Prix"] * x["Quantite"])
        valeur_vente = vente_plus_importante["Prix"] * vente_plus_importante["Quantite"]
        print(f"Vente la plus importante (en valeur): {vente_plus_importante['Produit']} ({valeur_vente}€)")
        
    except FileNotFoundError:
        print(f"Erreur: Le fichier {nom_fichier} n'existe pas")
    except Exception as e:
        print(f"Une erreur s'est produite: {e}")

# Appel de la fonction
analyser_ventes("ventes.csv")`}
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

export default StructuresControle;