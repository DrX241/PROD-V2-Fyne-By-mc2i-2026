import React from 'react';
import { ChevronRight, ChevronLeft, BrainCircuit, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FichiersProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const Fichiers: React.FC<FichiersProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manipulation de fichiers</h2>
      
      <div className="mb-6">
        <p className="mb-4">La manipulation de fichiers est une compétence essentielle en data science et en programmation Python en général. Elle vous permet de lire, écrire et traiter des données provenant de différentes sources.</p>
        
        <h3 className="text-xl font-semibold mb-3">Lecture et écriture de fichiers texte</h3>
        <p className="mb-3">Python offre des méthodes simples pour la manipulation de fichiers texte.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Ouverture et fermeture de fichiers</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Ouverture d'un fichier en mode lecture ('r')
fichier = open('exemple.txt', 'r')
contenu = fichier.read()  # Lit tout le contenu
fichier.close()  # Ferme le fichier

# Utilisation du gestionnaire de contexte 'with' (recommandé)
with open('exemple.txt', 'r') as fichier:
    contenu = fichier.read()
    # Le fichier est automatiquement fermé à la sortie du bloc 'with'
    
# Modes d'ouverture courants
# 'r': lecture seule (défaut)
# 'w': écriture (écrase le fichier s'il existe)
# 'a': ajout (append) à la fin du fichier
# 'r+': lecture et écriture
# 'b': mode binaire (ex: 'rb', 'wb')
# 't': mode texte (défaut, ex: 'rt', 'wt')

# Encodage des fichiers
with open('exemple.txt', 'r', encoding='utf-8') as fichier:
    contenu = fichier.read()`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Méthodes de lecture</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`with open('exemple.txt', 'r') as fichier:
    # Lire le fichier entier
    contenu = fichier.read()
    
    # Revenir au début du fichier
    fichier.seek(0)
    
    # Lire un certain nombre de caractères
    debut = fichier.read(10)  # Lit les 10 premiers caractères
    
    # Revenir au début
    fichier.seek(0)
    
    # Lire ligne par ligne
    premiere_ligne = fichier.readline()  # Lit une ligne
    deuxieme_ligne = fichier.readline()  # Lit la ligne suivante
    
    # Revenir au début
    fichier.seek(0)
    
    # Lire toutes les lignes dans une liste
    lignes = fichier.readlines()  # Liste de chaînes, chacune incluant '\\n'

# Itération sur les lignes d'un fichier (méthode la plus efficace pour les gros fichiers)
with open('exemple.txt', 'r') as fichier:
    for ligne in fichier:
        print(ligne.strip())  # strip() supprime les espaces en début/fin, y compris '\\n'`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Écriture dans un fichier</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Écriture basique
with open('nouveau.txt', 'w') as fichier:
    fichier.write('Bonjour, monde!\\n')
    fichier.write('Deuxième ligne.\\n')
    
# Écriture de plusieurs lignes
with open('plusieurs_lignes.txt', 'w') as fichier:
    lignes = ['Ligne 1\\n', 'Ligne 2\\n', 'Ligne 3\\n']
    fichier.writelines(lignes)  # writelines() n'ajoute pas de saut de ligne

# Ajout à un fichier existant
with open('journal.txt', 'a') as fichier:
    fichier.write('Nouvelle entrée: ' + str(datetime.now()) + '\\n')
    
# Écrire des données formatées
with open('donnees.txt', 'w') as fichier:
    for i in range(1, 6):
        fichier.write(f"Ligne {i}: {i**2}\\n")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Manipulation de fichiers CSV</h3>
        <p className="mb-3">Les fichiers CSV (Comma-Separated Values) sont l'un des formats les plus courants pour les données tabulaires en data science.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Utilisation du module csv</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import csv

# Lecture d'un fichier CSV
with open('donnees.csv', 'r', newline='') as fichier:
    lecteur_csv = csv.reader(fichier, delimiter=',')
    
    # Accès aux en-têtes (première ligne)
    en_tetes = next(lecteur_csv)
    print(f"Colonnes: {en_tetes}")
    
    # Parcourir les lignes
    for ligne in lecteur_csv:
        print(f"Ligne: {ligne}")

# Lecture avec DictReader (accès par nom de colonne)
with open('donnees.csv', 'r', newline='') as fichier:
    lecteur_dict = csv.DictReader(fichier)
    
    for ligne in lecteur_dict:
        # Chaque ligne est un dictionnaire avec les noms de colonnes comme clés
        print(f"Nom: {ligne['nom']}, Age: {ligne['age']}")

# Écriture dans un fichier CSV
with open('export.csv', 'w', newline='') as fichier:
    colonnes = ['nom', 'age', 'ville']
    ecrivain = csv.DictWriter(fichier, fieldnames=colonnes)
    
    # Écrire l'en-tête
    ecrivain.writeheader()
    
    # Écrire des lignes
    ecrivain.writerow({'nom': 'Alice', 'age': '30', 'ville': 'Paris'})
    ecrivain.writerow({'nom': 'Bob', 'age': '25', 'ville': 'Lyon'})
    
    # Écrire plusieurs lignes
    donnees = [
        {'nom': 'Charlie', 'age': '35', 'ville': 'Marseille'},
        {'nom': 'David', 'age': '40', 'ville': 'Toulouse'}
    ]
    ecrivain.writerows(donnees)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-2">Pandas pour la manipulation de CSV</h4>
          <p className="mb-2">En data science, on utilise souvent pandas pour manipuler les fichiers CSV, car il offre des fonctionnalités plus avancées :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import pandas as pd

# Lecture d'un fichier CSV
df = pd.read_csv('donnees.csv')

# Afficher les premières lignes
print(df.head())

# Obtenir des informations sur le DataFrame
print(df.info())
print(df.describe())  # Statistiques descriptives

# Accéder aux colonnes
print(df['nom'])  # Une colonne spécifique
print(df[['nom', 'age']])  # Plusieurs colonnes

# Filtrer les données
adultes = df[df['age'] > 18]
parisiens = df[df['ville'] == 'Paris']

# Grouper et agréger
par_ville = df.groupby('ville').agg({'age': ['mean', 'min', 'max']})

# Écrire dans un CSV
df.to_csv('resultats.csv', index=False)`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Manipulation de fichiers JSON</h3>
        <p className="mb-3">JSON (JavaScript Object Notation) est un format de données léger et facile à lire, très utilisé pour l'échange de données et la configuration.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import json

# Données Python
donnees = {
    "personnes": [
        {"nom": "Alice", "age": 30, "langages": ["Python", "SQL", "R"]},
        {"nom": "Bob", "age": 25, "langages": ["Java", "C++", "Python"]}
    ],
    "entreprise": "Data Analytics Inc.",
    "annee_fondation": 2010,
    "active": True
}

# Écriture dans un fichier JSON
with open('donnees.json', 'w') as fichier:
    json.dump(donnees, fichier, indent=4)  # indent pour un format lisible

# Lecture d'un fichier JSON
with open('donnees.json', 'r') as fichier:
    donnees_lues = json.load(fichier)
    
print(donnees_lues["entreprise"])  # Data Analytics Inc.
print(donnees_lues["personnes"][0]["nom"])  # Alice

# Conversion de chaînes JSON
chaine_json = '{"nom": "Charlie", "age": 35}'
objet_python = json.loads(chaine_json)
print(objet_python["nom"])  # Charlie

# Conversion d'objet Python en chaîne JSON
nouvelle_chaine = json.dumps(objet_python, indent=2)
print(nouvelle_chaine)`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Manipulation de fichiers binaires</h3>
        <p className="mb-3">Les fichiers binaires sont utilisés pour stocker des données non textuelles comme des images, des vidéos, ou des structures de données spécifiques.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Lecture et écriture en mode binaire</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Lecture d'un fichier binaire
with open('image.jpg', 'rb') as fichier:
    donnees_binaires = fichier.read()
    print(f"Taille du fichier: {len(donnees_binaires)} octets")

# Copie d'un fichier binaire
with open('image.jpg', 'rb') as source:
    with open('copie_image.jpg', 'wb') as destination:
        destination.write(source.read())

# Utilisation de pickle pour sérialiser des objets Python
import pickle

# Sérialisation d'un objet Python
donnees = {
    'modele': 'RandomForest',
    'score': 0.92,
    'parametres': {'n_estimators': 100, 'max_depth': 5},
    'classes': ['chat', 'chien', 'oiseau']
}

# Écriture de l'objet sérialisé
with open('modele.pkl', 'wb') as fichier:
    pickle.dump(donnees, fichier)

# Lecture de l'objet sérialisé
with open('modele.pkl', 'rb') as fichier:
    donnees_chargees = pickle.load(fichier)
    
print(donnees_chargees['modele'])  # RandomForest
print(donnees_chargees['score'])   # 0.92`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-gradient-to-r from-amber-700/20 to-red-700/20 border border-amber-600/40 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2 text-amber-300">Attention avec pickle!</h4>
          <p className="text-amber-100 mb-2">Pickle est pratique mais présente des risques de sécurité :</p>
          <ul className="list-disc list-inside space-y-1 text-amber-200">
            <li>Ne chargez jamais un fichier pickle provenant d'une source non fiable</li>
            <li>pickle permet l'exécution de code arbitraire lors du déchargement</li>
            <li>Pour les données sensibles ou le partage, préférez JSON ou des formats standards</li>
          </ul>
          <p className="text-amber-100 mt-2">Pour des modèles de machine learning, utilisez joblib de scikit-learn qui est plus sûr et plus efficace pour les objets volumineux.</p>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Chemins de fichiers avec pathlib</h3>
        <p className="mb-3">Le module pathlib, introduit en Python 3.4, offre une approche orientée objet et plus intuitive pour manipuler les chemins de fichiers.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`from pathlib import Path

# Création d'un objet Path
chemin = Path('dossier/sous_dossier/fichier.txt')

# Propriétés du chemin
print(chemin.name)      # fichier.txt
print(chemin.stem)      # fichier
print(chemin.suffix)    # .txt
print(chemin.parent)    # dossier/sous_dossier
print(chemin.parents[0])  # dossier/sous_dossier
print(chemin.parents[1])  # dossier

# Création du chemin absolu
chemin_absolu = Path.cwd() / 'dossier' / 'fichier.txt'
print(chemin_absolu)

# Vérification de l'existence
if Path('fichier.txt').exists():
    print("Le fichier existe")

# Listing de fichiers
dossier = Path('.')
for fichier in dossier.glob('*.py'):  # Tous les fichiers Python
    print(fichier)

# Recherche récursive
for fichier in dossier.glob('**/*.csv'):  # Tous les fichiers CSV dans tous les sous-dossiers
    print(fichier)

# Création de dossiers
nouveau_dossier = Path('output/data')
nouveau_dossier.mkdir(parents=True, exist_ok=True)  # Crée les dossiers parents si nécessaire

# Lecture/écriture de fichiers avec pathlib
chemin_fichier = Path('exemple.txt')
chemin_fichier.write_text("Bonjour avec pathlib", encoding='utf-8')
contenu = chemin_fichier.read_text(encoding='utf-8')
print(contenu)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
            Application en Data Science
          </h3>
          <p className="text-blue-200 mb-3">Voici un exemple de script qui traite un fichier CSV de données climatiques pour effectuer une analyse simple :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import csv
from pathlib import Path
from datetime import datetime
import matplotlib.pyplot as plt

def analyser_donnees_meteo(fichier_csv):
    """
    Analyse un fichier CSV contenant des données météorologiques.
    Format attendu: date,temperature,humidite,precipitation
    """
    # Vérifier l'existence du fichier
    chemin = Path(fichier_csv)
    if not chemin.exists():
        print(f"Erreur: Le fichier {fichier_csv} n'existe pas.")
        return None
    
    # Préparer les structures de données
    dates = []
    temperatures = []
    humidite = []
    precipitation = []
    
    # Lire le fichier CSV
    with open(chemin, 'r', newline='') as f:
        lecteur = csv.DictReader(f)
        for ligne in lecteur:
            try:
                # Convertir les données
                date = datetime.strptime(ligne['date'], '%Y-%m-%d')
                temp = float(ligne['temperature'])
                hum = float(ligne['humidite'])
                precip = float(ligne['precipitation'])
                
                # Stocker les données
                dates.append(date)
                temperatures.append(temp)
                humidite.append(hum)
                precipitation.append(precip)
                
            except (ValueError, KeyError) as e:
                print(f"Erreur avec la ligne {ligne}: {e}")
                continue
    
    # Calculer des statistiques de base
    if not temperatures:
        print("Aucune donnée valide trouvée.")
        return None
    
    temp_moyenne = sum(temperatures) / len(temperatures)
    temp_max = max(temperatures)
    temp_min = min(temperatures)
    jour_plus_chaud = dates[temperatures.index(temp_max)].strftime('%Y-%m-%d')
    jour_plus_froid = dates[temperatures.index(temp_min)].strftime('%Y-%m-%d')
    
    total_precip = sum(precipitation)
    
    # Afficher les résultats
    print("=== Analyse des données météorologiques ===")
    print(f"Nombre d'observations: {len(dates)}")
    print(f"Température moyenne: {temp_moyenne:.1f}°C")
    print(f"Température maximale: {temp_max}°C (le {jour_plus_chaud})")
    print(f"Température minimale: {temp_min}°C (le {jour_plus_froid})")
    print(f"Précipitations totales: {total_precip:.1f} mm")
    
    # Créer un dossier pour les sorties si nécessaire
    dossier_sortie = Path('resultats')
    dossier_sortie.mkdir(exist_ok=True)
    
    # Créer un fichier de résumé
    with open(dossier_sortie / 'resume_meteo.txt', 'w') as f:
        f.write("=== Résumé des données météorologiques ===\\n")
        f.write(f"Période: {dates[0].strftime('%Y-%m-%d')} au {dates[-1].strftime('%Y-%m-%d')}\\n")
        f.write(f"Température moyenne: {temp_moyenne:.1f}°C\\n")
        f.write(f"Température maximale: {temp_max}°C (le {jour_plus_chaud})\\n")
        f.write(f"Température minimale: {temp_min}°C (le {jour_plus_froid})\\n")
        f.write(f"Précipitations totales: {total_precip:.1f} mm\\n")
    
    # Créer un graphique
    plt.figure(figsize=(12, 6))
    plt.plot(dates, temperatures, label='Température (°C)')
    plt.title('Évolution de la température')
    plt.xlabel('Date')
    plt.ylabel('Température (°C)')
    plt.legend()
    plt.grid(True)
    plt.savefig(dossier_sortie / 'graphique_temperatures.png')
    plt.close()
    
    print(f"Fichiers de sortie créés dans le dossier {dossier_sortie}")
    return {
        'temp_moyenne': temp_moyenne,
        'temp_max': temp_max,
        'temp_min': temp_min,
        'jour_plus_chaud': jour_plus_chaud,
        'jour_plus_froid': jour_plus_froid,
        'total_precip': total_precip
    }

# Exemple d'utilisation (avec un fichier fictif)
if __name__ == "__main__":
    # Si le fichier n'existe pas, ce code juste montre l'implémentation
    resultats = analyser_donnees_meteo('donnees_meteo.csv')
    
    # Dans un cas réel, on pourrait utiliser ces résultats pour d'autres analyses
    if resultats:
        if resultats['temp_moyenne'] > 20:
            print("La température moyenne est élevée pour la saison.")
        else:
            print("La température moyenne est normale ou basse pour la saison.")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Autres formats de fichiers courants en Data Science</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-900/30 rounded-md p-4">
            <h4 className="font-semibold mb-2">Excel avec pandas</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
              {`import pandas as pd

# Lecture d'un fichier Excel
df = pd.read_excel('donnees.xlsx', sheet_name='Feuil1')
print(df.head())

# Écriture dans un fichier Excel
df.to_excel('resultats.xlsx', sheet_name='Résultats', index=False)

# Lecture de plusieurs feuilles
with pd.ExcelFile('fichier_multi_feuilles.xlsx') as xls:
    df1 = pd.read_excel(xls, 'Feuille1')
    df2 = pd.read_excel(xls, 'Feuille2')`}
            </SyntaxHighlighter>
          </div>
          
          <div className="bg-blue-900/30 rounded-md p-4">
            <h4 className="font-semibold mb-2">Parquet et HDF5 (données volumineuses)</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
              {`# Parquet (nécessite pyarrow ou fastparquet)
# pip install pyarrow ou pip install fastparquet
import pandas as pd

# Écriture en Parquet (format colonnaire efficace)
df.to_parquet('donnees.parquet')

# Lecture d'un fichier Parquet
df_parquet = pd.read_parquet('donnees.parquet')

# HDF5 (format hiérarchique pour données scientifiques)
# pip install tables
df.to_hdf('donnees.h5', key='df', mode='w')
df_hdf = pd.read_hdf('donnees.h5', key='df')`}
            </SyntaxHighlighter>
          </div>
          
          <div className="bg-blue-900/30 rounded-md p-4">
            <h4 className="font-semibold mb-2">SQL avec pandas</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
              {`import pandas as pd
import sqlite3

# Connexion à une base de données SQLite
conn = sqlite3.connect('ma_base.db')

# Lecture d'une table SQL
df = pd.read_sql('SELECT * FROM clients', conn)

# Écriture dans une table SQL
df.to_sql('clients_new', conn, if_exists='replace', index=False)

# Exécution d'une requête directe
df_age = pd.read_sql('SELECT AVG(age) FROM clients', conn)
conn.close()`}
            </SyntaxHighlighter>
          </div>
          
          <div className="bg-blue-900/30 rounded-md p-4">
            <h4 className="font-semibold mb-2">Fichiers compressés</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
              {`import pandas as pd
import gzip, zipfile

# Lecture de CSV compressé directement avec pandas
df = pd.read_csv('donnees.csv.gz', compression='gzip')
df.to_csv('sortie.csv.gz', compression='gzip')

# Avec le module zipfile
with zipfile.ZipFile('archive.zip', 'r') as z:
    with z.open('fichier_dans_archive.csv') as f:
        df = pd.read_csv(f)
        
# Création d'une archive
with zipfile.ZipFile('nouvelle_archive.zip', 'w') as z:
    z.write('fichier1.csv')
    z.write('fichier2.csv')`}
            </SyntaxHighlighter>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Analyse de journal</h4>
          <p className="mb-2">Écrivez un script qui analyse un fichier de journal (log) pour compter les différents types d'événements et identifier les erreurs.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def analyser_journal(chemin_fichier):
    """
    Analyse un fichier journal pour compter les types d'événements et extraire les erreurs.
    Format attendu: [DATE] [NIVEAU] Message
    """
    # Dictionnaires pour stocker les résultats
    compteurs = {'INFO': 0, 'WARNING': 0, 'ERROR': 0, 'DEBUG': 0}
    erreurs = []
    
    try:
        with open(chemin_fichier, 'r') as fichier:
            for ligne in fichier:
                ligne = ligne.strip()
                
                # Vérifier si la ligne suit le format attendu
                if ligne and ligne.startswith('['):
                    # Extraction du niveau de log
                    debut_niveau = ligne.find('[', 1)
                    fin_niveau = ligne.find(']', debut_niveau)
                    
                    if debut_niveau != -1 and fin_niveau != -1:
                        niveau = ligne[debut_niveau+1:fin_niveau].strip().upper()
                        
                        # Compter les occurrences
                        if niveau in compteurs:
                            compteurs[niveau] += 1
                        
                        # Collecter les erreurs
                        if niveau == 'ERROR':
                            message = ligne[fin_niveau+1:].strip()
                            erreurs.append(message)
        
        # Préparer le rapport
        total_entrees = sum(compteurs.values())
        rapport = {
            'total': total_entrees,
            'compteurs': compteurs,
            'pourcentages': {niveau: (count/total_entrees*100 if total_entrees > 0 else 0) 
                             for niveau, count in compteurs.items()},
            'erreurs': erreurs
        }
        
        return rapport
        
    except FileNotFoundError:
        print(f"Erreur: Le fichier {chemin_fichier} n'existe pas.")
        return None
    except Exception as e:
        print(f"Erreur lors de l'analyse du fichier: {e}")
        return None

# Exemple d'utilisation
def afficher_rapport(rapport):
    if not rapport:
        return
    
    print("=== Rapport d'analyse du journal ===")
    print(f"Total des entrées: {rapport['total']}")
    print("\\nRépartition par niveau:")
    for niveau, count in rapport['compteurs'].items():
        print(f"- {niveau}: {count} ({rapport['pourcentages'][niveau]:.1f}%)")
    
    print("\\nErreurs détectées:")
    if rapport['erreurs']:
        for i, erreur in enumerate(rapport['erreurs'][:10], 1):  # Limiter à 10 erreurs
            print(f"{i}. {erreur}")
        
        if len(rapport['erreurs']) > 10:
            print(f"... et {len(rapport['erreurs']) - 10} autres erreurs")
    else:
        print("Aucune erreur détectée")
    
    # Écrire les erreurs dans un fichier
    with open('erreurs_extraites.log', 'w') as f:
        for erreur in rapport['erreurs']:
            f.write(f"{erreur}\\n")
    
    if rapport['erreurs']:
        print("\\nLes erreurs ont été exportées dans 'erreurs_extraites.log'")

# Test avec un fichier d'exemple
# Dans un cas réel, on passerait le chemin du fichier journal en paramètre
rapport = analyser_journal('application.log')
afficher_rapport(rapport)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Gestionnaire de données clients</h4>
          <p className="mb-2">Créez un script qui permet de gérer une base de données clients stockée dans un fichier CSV avec des fonctions pour ajouter, rechercher et exporter des clients.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import csv
import json
from pathlib import Path
import pandas as pd

class GestionnaireClients:
    """Gestionnaire de base de données clients stockée en CSV."""
    
    def __init__(self, fichier_csv):
        """
        Initialise le gestionnaire avec le chemin du fichier CSV.
        Crée le fichier s'il n'existe pas.
        """
        self.chemin = Path(fichier_csv)
        self.colonnes = ['id', 'nom', 'email', 'telephone', 'ville', 'client_depuis']
        
        # Créer le fichier s'il n'existe pas
        if not self.chemin.exists():
            with open(self.chemin, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=self.colonnes)
                writer.writeheader()
            print(f"Fichier {fichier_csv} créé avec succès.")
    
    def charger_clients(self):
        """Charge tous les clients depuis le fichier CSV."""
        clients = []
        try:
            with open(self.chemin, 'r', newline='') as f:
                reader = csv.DictReader(f)
                for ligne in reader:
                    clients.append(ligne)
            return clients
        except Exception as e:
            print(f"Erreur lors du chargement des clients: {e}")
            return []
    
    def ajouter_client(self, client):
        """
        Ajoute un nouveau client au fichier CSV.
        Le client doit être un dictionnaire avec les clés correspondant aux colonnes.
        """
        try:
            # Vérifier que les clés requises sont présentes
            for cle in self.colonnes:
                if cle not in client:
                    client[cle] = ""  # Valeur par défaut vide
            
            # Ajouter le client au fichier
            with open(self.chemin, 'a', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=self.colonnes)
                writer.writerow(client)
            
            print(f"Client {client.get('nom', 'sans nom')} ajouté avec succès.")
            return True
        except Exception as e:
            print(f"Erreur lors de l'ajout du client: {e}")
            return False
    
    def rechercher_clients(self, critere, valeur):
        """
        Recherche des clients selon un critère spécifique.
        
        Args:
            critere: La colonne sur laquelle effectuer la recherche
            valeur: La valeur à rechercher
            
        Returns:
            Liste des clients correspondant au critère
        """
        if critere not in self.colonnes:
            print(f"Critère invalide. Utilisez l'un des suivants: {', '.join(self.colonnes)}")
            return []
        
        resultats = []
        clients = self.charger_clients()
        
        for client in clients:
            if valeur.lower() in client[critere].lower():
                resultats.append(client)
        
        return resultats
    
    def exporter_json(self, chemin_sortie):
        """Exporte la base de données clients au format JSON."""
        try:
            clients = self.charger_clients()
            with open(chemin_sortie, 'w') as f:
                json.dump(clients, f, indent=2)
            print(f"Export JSON réussi: {chemin_sortie}")
            return True
        except Exception as e:
            print(f"Erreur lors de l'export JSON: {e}")
            return False
    
    def exporter_excel(self, chemin_sortie):
        """Exporte la base de données clients au format Excel."""
        try:
            clients = self.charger_clients()
            df = pd.DataFrame(clients)
            df.to_excel(chemin_sortie, index=False)
            print(f"Export Excel réussi: {chemin_sortie}")
            return True
        except Exception as e:
            print(f"Erreur lors de l'export Excel: {e}")
            return False
    
    def statistiques(self):
        """Génère des statistiques sur la base clients."""
        clients = self.charger_clients()
        
        if not clients:
            return {"total": 0, "message": "Aucun client dans la base de données"}
        
        # Compter les clients par ville
        villes = {}
        for client in clients:
            ville = client.get('ville', 'Inconnue')
            villes[ville] = villes.get(ville, 0) + 1
        
        # Trier les villes par nombre de clients
        villes_triees = sorted(villes.items(), key=lambda x: x[1], reverse=True)
        
        return {
            "total": len(clients),
            "villes": villes_triees,
            "ville_principale": villes_triees[0][0] if villes_triees else "N/A"
        }

# Exemple d'utilisation
if __name__ == "__main__":
    gestionnaire = GestionnaireClients('clients.csv')
    
    # Ajouter quelques clients d'exemple
    gestionnaire.ajouter_client({
        'id': '1', 'nom': 'Dupont Alice', 'email': 'alice@example.com',
        'telephone': '0612345678', 'ville': 'Paris', 'client_depuis': '2020-05-15'
    })
    
    gestionnaire.ajouter_client({
        'id': '2', 'nom': 'Martin Bob', 'email': 'bob@example.com',
        'telephone': '0687654321', 'ville': 'Lyon', 'client_depuis': '2021-03-22'
    })
    
    # Rechercher des clients
    resultats = gestionnaire.rechercher_clients('ville', 'Paris')
    print(f"Recherche: {len(resultats)} clients trouvés à Paris")
    
    # Afficher des statistiques
    stats = gestionnaire.statistiques()
    print(f"Total des clients: {stats['total']}")
    print(f"Ville principale: {stats['ville_principale']}")
    
    # Exporter les données
    gestionnaire.exporter_json('clients.json')
    gestionnaire.exporter_excel('clients.xlsx')`}
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

export default Fichiers;