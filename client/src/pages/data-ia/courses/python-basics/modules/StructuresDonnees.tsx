import React from 'react';
import { ChevronRight, ChevronLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface StructuresDonneesProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const StructuresDonnees: React.FC<StructuresDonneesProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Structures de données</h2>
      
      <div className="mb-6">
        <p className="mb-4">Les structures de données sont essentielles en Python, particulièrement pour la data science. Elles vous permettent d'organiser, de stocker et de manipuler efficacement les données.</p>
        
        <h3 className="text-xl font-semibold mb-3">Listes</h3>
        <p className="mb-3">Les listes sont des collections ordonnées et modifiables d'éléments. Elles sont l'une des structures de données les plus utilisées en Python.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Création et manipulation de listes</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3">
            {`# Création de liste
nombres = [1, 2, 3, 4, 5]
langages = ["Python", "R", "SQL", "Java"]
mixte = [1, "Python", True, 3.14]
liste_vide = []

# Accès aux éléments (indexation commence à 0)
print(langages[0])       # Python
print(langages[-1])      # Java (indexation négative)

# Tranches (slicing)
print(nombres[1:3])      # [2, 3]
print(nombres[:3])       # [1, 2, 3]
print(nombres[2:])       # [3, 4, 5]
print(nombres[::2])      # [1, 3, 5] (pas de 2)

# Modification
langages[1] = "Julia"    # Remplace "R" par "Julia"
print(langages)          # ["Python", "Julia", "SQL", "Java"]

# Méthodes utiles
langages.append("C++")   # Ajoute à la fin
langages.insert(2, "R")  # Insère à l'index 2
langages.remove("SQL")   # Supprime par valeur
popped = langages.pop()  # Supprime et retourne le dernier élément
langages.sort()          # Trie la liste (modifie la liste)
langages.reverse()       # Inverse la liste (modifie la liste)
len(langages)            # Nombre d'éléments`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Compréhensions de liste</h4>
          <p className="mb-2">Une façon concise et puissante de créer des listes :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Sans compréhension
carres = []
for i in range(1, 6):
    carres.append(i**2)
print(carres)  # [1, 4, 9, 16, 25]

# Avec compréhension
carres = [i**2 for i in range(1, 6)]
print(carres)  # [1, 4, 9, 16, 25]

# Avec condition
nombres_pairs = [i for i in range(1, 11) if i % 2 == 0]
print(nombres_pairs)  # [2, 4, 6, 8, 10]

# Pour la data science (exemple simple)
temperatures_c = [20, 25, 30, 35, 40]
temperatures_f = [temp * 9/5 + 32 for temp in temperatures_c]
print(temperatures_f)  # [68.0, 77.0, 86.0, 95.0, 104.0]`}
          </SyntaxHighlighter>
        </div>

        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Fonctions intégrées utiles pour les listes</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Opérations sur les listes
nombres = [4, 1, 7, 9, 3, 5, 2]
print(sum(nombres))      # 31 (somme)
print(min(nombres))      # 1 (minimum)
print(max(nombres))      # 9 (maximum)
print(sorted(nombres))   # [1, 2, 3, 4, 5, 7, 9] (tri sans modifier la liste)

# Fonctions avec les listes
print(any([False, False, True]))  # True (au moins un élément True)
print(all([True, True, False]))   # False (tous les éléments sont True)

# Énumération pour obtenir l'index et la valeur
fruits = ["pomme", "banane", "orange"]
for index, fruit in enumerate(fruits):
    print(f"Index {index}: {fruit}")

# Zip pour combiner des listes
noms = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
for nom, age in zip(noms, ages):
    print(f"{nom} a {age} ans")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Tuples</h3>
        <p className="mb-3">Les tuples sont similaires aux listes, mais ils sont <strong>immuables</strong> (ne peuvent pas être modifiés après création).</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création de tuples
coordonnees = (10, 20)
personne = ("Alice", 30, "Data Scientist")
singleton = (42,)  # Virgule nécessaire pour un seul élément
tuple_vide = ()

# Accès aux éléments (comme pour les listes)
print(personne[0])     # Alice
print(personne[-1])    # Data Scientist

# Déballage de tuple
nom, age, poste = personne
print(nom, age, poste)  # Alice 30 Data Scientist

# Tuples comme retour de fonction
def get_dimensions():
    return (1920, 1080)  # Retourne un tuple

largeur, hauteur = get_dimensions()  # Déballage direct
print(f"Résolution: {largeur}x{hauteur}")  # Résolution: 1920x1080

# Méthodes (limitées car immuable)
personne.count("Alice")  # Compte les occurrences
personne.index(30)       # Index de la première occurrence`}
          </SyntaxHighlighter>
        </div>

        <div className="bg-blue-900/30 rounded-md p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-2 flex items-center">
            <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
            Quand utiliser les tuples plutôt que les listes?
          </h4>
          <ul className="list-disc list-inside space-y-1 text-blue-200">
            <li>Pour des collections de données qui ne devraient pas changer (coordonnées, dates, configurations, etc.)</li>
            <li>Comme clés de dictionnaires (les listes ne peuvent pas être utilisées comme clés)</li>
            <li>Pour les fonctions qui retournent plusieurs valeurs</li>
            <li>Pour clarifier le code quand les données ne doivent pas être modifiées</li>
            <li>Les tuples sont légèrement plus rapides et utilisent moins de mémoire que les listes équivalentes</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Dictionnaires</h3>
        <p className="mb-3">Les dictionnaires sont des collections non ordonnées de paires clé-valeur, extrêmement utiles en data science pour stocker des données structurées.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3">
            {`# Création de dictionnaire
etudiant = {
    "nom": "Alice",
    "age": 22,
    "cours": ["Python", "Machine Learning", "SQL"],
    "actif": True
}

# Accès aux valeurs
print(etudiant["nom"])            # Alice
print(etudiant.get("adresse"))    # None (pas d'erreur si clé n'existe pas)
print(etudiant.get("adresse", "Non spécifiée"))  # Valeur par défaut

# Modification
etudiant["age"] = 23              # Modifie une valeur existante
etudiant["adresse"] = "Paris"     # Ajoute une nouvelle paire clé-valeur
etudiant["cours"].append("Deep Learning")  # Modifie une liste contenue

# Suppression
del etudiant["actif"]             # Supprime une paire clé-valeur
adresse = etudiant.pop("adresse") # Supprime et retourne la valeur

# Méthodes utiles
etudiant.keys()                   # Objet dict_keys contenant les clés
etudiant.values()                 # Objet dict_values contenant les valeurs
etudiant.items()                  # Objet dict_items contenant des tuples (clé, valeur)

# Parcourir un dictionnaire
for cle in etudiant:
    print(cle, etudiant[cle])

for cle, valeur in etudiant.items():
    print(cle, valeur)`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Compréhensions de dictionnaire</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Créer un dictionnaire avec des carrés
carres = {i: i**2 for i in range(1, 6)}
print(carres)  # {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Filtrer un dictionnaire
notes = {"Alice": 85, "Bob": 70, "Charlie": 90, "David": 65}
reussite = {nom: note for nom, note in notes.items() if note >= 70}
print(reussite)  # {"Alice": 85, "Bob": 70, "Charlie": 90}

# Exemple pour la data science
donnees = {"temp": [20, 25, 30], "pression": [1010, 1008, 1012]}
moyennes = {cle: sum(valeurs)/len(valeurs) for cle, valeurs in donnees.items()}
print(moyennes)  # {"temp": 25.0, "pression": 1010.0}`}
          </SyntaxHighlighter>
        </div>

        <h3 className="text-xl font-semibold mb-3">Dictionnaires imbriqués</h3>
        <p className="mb-3">Les dictionnaires peuvent contenir d'autres dictionnaires, ce qui est très utile pour représenter des données hiérarchiques :</p>

        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-6">
          {`# Dictionnaire imbriqué pour stocker des données de vente par région et produit
ventes = {
    "Europe": {
        "France": {"Produit A": 120, "Produit B": 250},
        "Allemagne": {"Produit A": 180, "Produit B": 300}
    },
    "Amérique": {
        "USA": {"Produit A": 350, "Produit B": 420},
        "Canada": {"Produit A": 120, "Produit B": 170}
    }
}

# Accès à des valeurs imbriquées
print(ventes["Europe"]["France"]["Produit B"])  # 250

# Ajout d'un nouveau pays
ventes["Europe"]["Espagne"] = {"Produit A": 90, "Produit B": 120}

# Itération sur une structure imbriquée
for region, pays in ventes.items():
    print(f"Région: {region}")
    for pays_nom, produits in pays.items():
        total_pays = sum(produits.values())
        print(f"  {pays_nom}: {total_pays} unités vendues")

# Extraction de données spécifiques pour l'analyse
total_produit_a = 0
for region in ventes.values():
    for pays in region.values():
        total_produit_a += pays.get("Produit A", 0)
        
print(f"Total des ventes du Produit A: {total_produit_a}")`}
        </SyntaxHighlighter>
        
        <h3 className="text-xl font-semibold mb-3">Ensembles (sets)</h3>
        <p className="mb-3">Les ensembles sont des collections non ordonnées d'éléments uniques. Ils sont utiles pour la suppression de doublons et les opérations mathématiques d'ensemble.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création d'ensemble
langages = {"Python", "Java", "R", "Python"}  # Notez le doublon
print(langages)  # {"Python", "Java", "R"} - Le doublon est supprimé

# Conversion d'une liste en ensemble pour supprimer les doublons
liste_avec_doublons = [1, 2, 2, 3, 3, 3, 4]
liste_sans_doublons = list(set(liste_avec_doublons))
print(liste_sans_doublons)  # [1, 2, 3, 4]

# Opérations d'ensemble
science = {"Python", "R", "MATLAB"}
web = {"JavaScript", "HTML", "CSS", "Python"}

union = science | web  # ou science.union(web)
intersection = science & web  # ou science.intersection(web)
difference = science - web  # ou science.difference(web)
diff_sym = science ^ web  # ou science.symmetric_difference(web)

print(intersection)  # {"Python"}
print("Python" in science)  # True

# Méthodes des ensembles
languages = {"Python", "Java", "C++"}
languages.add("Go")             # Ajoute un élément
languages.remove("Java")        # Supprime un élément (erreur si absent)
languages.discard("Ruby")       # Supprime un élément (pas d'erreur si absent)
popped = languages.pop()        # Supprime et retourne un élément arbitraire
languages.clear()               # Supprime tous les éléments`}
          </SyntaxHighlighter>
        </div>

        <h3 className="text-xl font-semibold mb-3">Cas d'utilisation des ensembles en Data Science</h3>
        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-6">
          {`# Détection de valeurs uniques dans un jeu de données
donnees = [101, 102, 103, 104, 102, 101, 105, 106, 102]
valeurs_uniques = set(donnees)
print(f"Valeurs uniques: {valeurs_uniques}")
print(f"Nombre de valeurs uniques: {len(valeurs_uniques)}")

# Analyse des éléments communs et distincts entre deux ensembles de données
categorie_a = {"Alice", "Bob", "Charlie", "David"}
categorie_b = {"Charlie", "David", "Eve", "Frank"}

# Clients dans les deux catégories
print(f"Dans les deux catégories: {categorie_a & categorie_b}")

# Clients exclusivement dans la catégorie A
print(f"Uniquement catégorie A: {categorie_a - categorie_b}")

# Clients dans exactement une seule catégorie (pas les deux)
print(f"Dans une seule catégorie: {categorie_a ^ categorie_b}")

# Vérification d'appartenance (très rapide avec les sets)
utilisateur = "Alice"
if utilisateur in categorie_a:
    print(f"{utilisateur} est dans la catégorie A")

# Création d'un ensemble de mots-clés à partir d'un texte
texte = "Le machine learning et l'intelligence artificielle sont des domaines passionnants. Le machine learning est un sous-domaine de l'intelligence artificielle."
mots = texte.lower().replace(".", "").replace(",", "").split()
mots_uniques = set(mots)
print(f"Mots uniques: {mots_uniques}")
print(f"Nombre de mots uniques: {len(mots_uniques)}")`}
        </SyntaxHighlighter>
        
        <h3 className="text-xl font-semibold mb-3">Comparaison des structures de données</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900/50">
                <th className="border border-blue-800 p-2 text-left">Structure</th>
                <th className="border border-blue-800 p-2 text-left">Mutabilité</th>
                <th className="border border-blue-800 p-2 text-left">Ordonné</th>
                <th className="border border-blue-800 p-2 text-left">Indexable</th>
                <th className="border border-blue-800 p-2 text-left">Cas d'utilisation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Liste</td>
                <td className="border border-blue-800 p-2">Mutable</td>
                <td className="border border-blue-800 p-2">Oui</td>
                <td className="border border-blue-800 p-2">Oui</td>
                <td className="border border-blue-800 p-2">Séquences de données, tableau 1D</td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">Tuple</td>
                <td className="border border-blue-800 p-2">Immuable</td>
                <td className="border border-blue-800 p-2">Oui</td>
                <td className="border border-blue-800 p-2">Oui</td>
                <td className="border border-blue-800 p-2">Groupes de valeurs fixes, retour multiple</td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Dictionnaire</td>
                <td className="border border-blue-800 p-2">Mutable</td>
                <td className="border border-blue-800 p-2">Oui*</td>
                <td className="border border-blue-800 p-2">Par clé</td>
                <td className="border border-blue-800 p-2">Données structurées, lookup rapide</td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">Ensemble</td>
                <td className="border border-blue-800 p-2">Mutable</td>
                <td className="border border-blue-800 p-2">Non</td>
                <td className="border border-blue-800 p-2">Non</td>
                <td className="border border-blue-800 p-2">Suppression de doublons, appartenance</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs mt-1 text-blue-300">* Les dictionnaires préservent l'ordre d'insertion depuis Python 3.7</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
            Application en Data Science
          </h3>
          <p className="text-blue-200 mb-3">Création d'un tableau de données simple (comme un DataFrame pandas basique) :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Données d'un petit dataset
donnees = {
    "nom": ["Alice", "Bob", "Charlie", "David", "Eve"],
    "age": [24, 32, 18, 45, 37],
    "ville": ["Paris", "Lyon", "Marseille", "Toulouse", "Lille"],
    "salaire": [45000, 55000, 32000, 67000, 58000]
}

# Statistiques de base (similaire à pandas)
# Calcul de l'âge moyen
age_moyen = sum(donnees["age"]) / len(donnees["age"])
print(f"Âge moyen: {age_moyen:.1f} ans")  # Âge moyen: 31.2 ans

# Salaire maximal et la personne correspondante
max_salaire = max(donnees["salaire"])
index_max_salaire = donnees["salaire"].index(max_salaire)
nom_max_salaire = donnees["nom"][index_max_salaire]
print(f"Salaire maximal: {max_salaire}€ (employé: {nom_max_salaire})")  # Salaire maximal: 67000€ (employé: David)

# Filtrage des données (comme avec pandas .query())
jeunes_employes = []
for i in range(len(donnees["nom"])):
    if donnees["age"][i] < 30 and donnees["salaire"][i] > 40000:
        jeunes_employes.append(donnees["nom"][i])
        
print(f"Jeunes employés bien payés: {jeunes_employes}")  # Jeunes employés bien payés: ['Alice']

# Ajout d'une nouvelle colonne (comme dans pandas)
# Calculer le bonus comme 10% du salaire
donnees["bonus"] = [salaire * 0.1 for salaire in donnees["salaire"]]

# Afficher la table mise à jour (de façon simplifiée)
for i in range(len(donnees["nom"])):
    print(f"{donnees['nom'][i]}: {donnees['age'][i]} ans, {donnees['ville'][i]}, {donnees['salaire'][i]}€, bonus: {donnees['bonus'][i]}€")`}
          </SyntaxHighlighter>
          <div className="bg-slate-800 p-2 rounded-b-md border-t border-slate-700 text-green-400 font-mono text-sm">
            Âge moyen: 31.2 ans<br/>
            Salaire maximal: 67000€ (employé: David)<br/>
            Jeunes employés bien payés: ['Alice']<br/>
            Alice: 24 ans, Paris, 45000€, bonus: 4500.0€<br/>
            Bob: 32 ans, Lyon, 55000€, bonus: 5500.0€<br/>
            Charlie: 18 ans, Marseille, 32000€, bonus: 3200.0€<br/>
            David: 45 ans, Toulouse, 67000€, bonus: 6700.0€<br/>
            Eve: 37 ans, Lille, 58000€, bonus: 5800.0€
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>

        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Analyse de fréquence</h4>
          <p className="mb-2">Écrivez un programme qui compte la fréquence de chaque mot dans un texte.</p>

          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def analyser_frequence_mots(texte):
    # Nettoyage du texte
    texte = texte.lower()
    # Remplacer la ponctuation par des espaces
    for ponctuation in ".,;:!?()[]{}\"'":
        texte = texte.replace(ponctuation, " ")
    
    # Diviser en mots
    mots = texte.split()
    
    # Comptage de fréquence
    frequences = {}
    for mot in mots:
        if mot in frequences:
            frequences[mot] += 1
        else:
            frequences[mot] = 1
    
    return frequences

# Test avec un texte
texte = """
Le machine learning, un sous-domaine de l'intelligence artificielle,
permet aux ordinateurs d'apprendre sans être explicitement programmés.
Le machine learning utilise des algorithmes pour analyser des données,
apprendre de ces données et faire des prédictions.
"""

frequences = analyser_frequence_mots(texte)

# Afficher les résultats triés par fréquence décroissante
for mot, freq in sorted(frequences.items(), key=lambda x: x[1], reverse=True):
    if freq > 1:  # Seulement les mots qui apparaissent plus d'une fois
        print(f"{mot}: {freq} occurrences")`}
          </SyntaxHighlighter>
        </div>

        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Analyse de données d'un magasin</h4>
          <p className="mb-2">Vous avez des données sur les ventes d'un magasin et vous devez effectuer quelques analyses.</p>

          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Données des ventes sur une semaine
ventes = [
    {"produit": "Ordinateur", "categorie": "Électronique", "prix": 1200, "quantite": 5},
    {"produit": "Clavier", "categorie": "Électronique", "prix": 80, "quantite": 10},
    {"produit": "Souris", "categorie": "Électronique", "prix": 25, "quantite": 15},
    {"produit": "Bureau", "categorie": "Mobilier", "prix": 350, "quantite": 3},
    {"produit": "Chaise", "categorie": "Mobilier", "prix": 150, "quantite": 7},
    {"produit": "Livre Python", "categorie": "Livres", "prix": 45, "quantite": 12},
    {"produit": "Livre ML", "categorie": "Livres", "prix": 60, "quantite": 8}
]

# 1. Calculer le chiffre d'affaires total
ca_total = sum(item["prix"] * item["quantite"] for item in ventes)
print(f"Chiffre d'affaires total: {ca_total}€")

# 2. Trouver le produit avec le plus de ventes en quantité
produit_max_ventes = max(ventes, key=lambda x: x["quantite"])
print(f"Produit le plus vendu: {produit_max_ventes['produit']} ({produit_max_ventes['quantite']} unités)")

# 3. Calculer le CA par catégorie
ca_par_categorie = {}
for item in ventes:
    categorie = item["categorie"]
    montant = item["prix"] * item["quantite"]
    
    if categorie in ca_par_categorie:
        ca_par_categorie[categorie] += montant
    else:
        ca_par_categorie[categorie] = montant

print("\\nChiffre d'affaires par catégorie:")
for categorie, montant in ca_par_categorie.items():
    print(f"{categorie}: {montant}€")

# 4. Liste des produits dont le prix est supérieur à la moyenne
prix_moyen = sum(item["prix"] for item in ventes) / len(ventes)
produits_premium = [item["produit"] for item in ventes if item["prix"] > prix_moyen]

print(f"\\nPrix moyen: {prix_moyen:.2f}€")
print(f"Produits premium: {produits_premium}")`}
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

export default StructuresDonnees;