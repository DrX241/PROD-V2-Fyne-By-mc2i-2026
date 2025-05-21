import pandas as pd
import numpy as np

# Créer un DataFrame simple
data = {
    'Nom': ['Eddy', 'Neil', 'Yousra', 'Fares', 'Guillaume', 'Nosing', 'Arnaud', 'Olivier'],
    'Role': ['Consultant data', 'Data scientist senior', 'Cheffe de projet', 'Consultant BI', 
             'Directeur IMPULSE', 'Directeur DIXIT', 'Président', 'Directeur Général'],
    'Experience': [3, 8, 5, 4, 15, 12, 20, 18],
    'Projets': [5, 12, 8, 6, 25, 20, 30, 28]
}

df = pd.DataFrame(data)

print("DataFrame original:")
print(df)
print("\nStatistiques descriptives:")
print(df.describe())

# Effectuer quelques opérations de base
print("\nExpérience moyenne par rôle:")
print(df.groupby('Role')['Experience'].mean())

# Création d'une nouvelle colonne
df['Projets_par_annee'] = df['Projets'] / df['Experience']
print("\nDataFrame avec nouvelle colonne:")
print(df)

print("\nTest pandas réussi!")