import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

# Créer un répertoire pour les images si nécessaire
if not os.path.exists("outputs"):
    os.makedirs("outputs")

# Créer des données pour notre graphique
data = {
    'Nom': ['Eddy', 'Neil', 'Yousra', 'Fares', 'Guillaume', 'Nosing', 'Arnaud', 'Olivier'],
    'Role': ['Consultant data', 'Data scientist senior', 'Cheffe de projet', 'Consultant BI', 
             'Directeur IMPULSE', 'Directeur IMPULSE', 'Président', 'Directeur Général'],
    'Experience': [3, 8, 5, 4, 15, 12, 20, 18],
    'Projets': [5, 12, 8, 6, 25, 20, 30, 28]
}

df = pd.DataFrame(data)

# Graphique 1: Diagramme à barres des expériences
plt.figure(figsize=(10, 6))
plt.bar(df['Nom'], df['Experience'], color='skyblue')
plt.title('Années d\'expérience par personne', fontsize=14)
plt.xlabel('Nom', fontsize=12)
plt.ylabel('Années d\'expérience', fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('outputs/experience_par_personne.png')
print("Graphique 1 créé: outputs/experience_par_personne.png")

# Graphique 2: Relation entre l'expérience et le nombre de projets
plt.figure(figsize=(8, 6))
plt.scatter(df['Experience'], df['Projets'], alpha=0.7, s=100)
for i, nom in enumerate(df['Nom']):
    plt.annotate(nom, (df['Experience'][i], df['Projets'][i]), 
                 xytext=(5, 5), textcoords='offset points')
plt.title('Relation entre l\'expérience et le nombre de projets', fontsize=14)
plt.xlabel('Années d\'expérience', fontsize=12)
plt.ylabel('Nombre de projets', fontsize=12)
plt.grid(True, linestyle='--', alpha=0.7)

# Ajout d'une ligne de tendance
z = np.polyfit(df['Experience'], df['Projets'], 1)
p = np.poly1d(z)
plt.plot(df['Experience'], p(df['Experience']), "r--", alpha=0.7)
plt.tight_layout()
plt.savefig('outputs/correlation_experience_projets.png')
print("Graphique 2 créé: outputs/correlation_experience_projets.png")

print("\nTest matplotlib réussi!")