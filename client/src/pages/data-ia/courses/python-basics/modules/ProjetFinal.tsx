import React from 'react';
import { ChevronLeft, Brain, Sparkles, FileSearch, Database, BarChart, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ProjetFinalProps {
  goToPrev: () => void;
}

const ProjetFinal: React.FC<ProjetFinalProps> = ({ goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Projet final: Analyse de données</h2>
      
      <div className="mb-6">
        <p className="mb-4">Ce projet final vous permettra d'appliquer toutes les connaissances acquises au cours des modules précédents dans un contexte réel d'analyse de données. Vous allez créer une application complète d'analyse de données qui comprend le chargement, le nettoyage, l'analyse, la visualisation et la modélisation de données.</p>
        
        <div className="bg-gradient-to-r from-blue-700/30 to-indigo-700/30 border border-blue-700/60 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <Brain className="h-6 w-6 text-blue-400 mr-2" />
            Objectif du projet
          </h3>
          <p className="mb-3">Développer une application d'analyse de données complète qui permet à un utilisateur d'explorer et d'analyser un ensemble de données sur les ventes d'une entreprise.</p>
          
          <h4 className="text-lg font-semibold mt-4 mb-2">Fonctionnalités principales</h4>
          <ul className="list-disc list-inside space-y-1 text-blue-200">
            <li>Chargement et nettoyage de données</li>
            <li>Analyse statistique descriptive</li>
            <li>Visualisations interactives</li>
            <li>Prédiction de ventes futures avec machine learning</li>
            <li>Génération de rapports et recommandations</li>
          </ul>
          
          <h4 className="text-lg font-semibold mt-4 mb-2">Concepts et compétences appliqués</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            <div className="bg-blue-900/40 rounded-md p-2 text-center">
              <Terminal className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <span className="text-sm">Bases de Python</span>
            </div>
            <div className="bg-blue-900/40 rounded-md p-2 text-center">
              <FileSearch className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <span className="text-sm">Manipulation de fichiers</span>
            </div>
            <div className="bg-blue-900/40 rounded-md p-2 text-center">
              <Database className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <span className="text-sm">Pandas / NumPy</span>
            </div>
            <div className="bg-blue-900/40 rounded-md p-2 text-center">
              <BarChart className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <span className="text-sm">Matplotlib / Seaborn</span>
            </div>
            <div className="bg-blue-900/40 rounded-md p-2 text-center">
              <Brain className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <span className="text-sm">Machine Learning</span>
            </div>
            <div className="bg-blue-900/40 rounded-md p-2 text-center">
              <Sparkles className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <span className="text-sm">Bonnes pratiques</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Structure du projet</h3>
        <p className="mb-3">Notre projet suivra une structure organisée et modulaire pour faciliter la maintenance et l'extension :</p>
        
        <SyntaxHighlighter language="plaintext" style={vscDarkPlus} className="rounded-md mb-6">
          {`sales_analyzer/
│
├── data/                      # Dossier pour les données
│   ├── raw/                   # Données brutes
│   └── processed/             # Données nettoyées
│
├── src/                       # Code source
│   ├── __init__.py
│   ├── data_loader.py         # Chargement et prétraitement des données
│   ├── data_analyzer.py       # Analyse statistique
│   ├── data_visualizer.py     # Visualisations
│   ├── sales_predictor.py     # Modèles de prédiction
│   └── report_generator.py    # Génération de rapports
│
├── notebooks/                 # Jupyter notebooks pour l'exploration
│   └── exploration.ipynb
│
├── tests/                     # Tests unitaires
│   ├── __init__.py
│   ├── test_data_loader.py
│   └── ...
│
├── output/                    # Rapports et visualisations générés
│
├── requirements.txt           # Dépendances
├── README.md                  # Documentation
└── main.py                    # Point d'entrée principal`}
        </SyntaxHighlighter>
        
        <h3 className="text-xl font-semibold mb-3">Jeu de données</h3>
        <p className="mb-3">Pour ce projet, nous utiliserons un jeu de données de ventes fictives avec la structure suivante :</p>
        
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900/50">
                <th className="border border-blue-800 p-2 text-left">Colonne</th>
                <th className="border border-blue-800 p-2 text-left">Type</th>
                <th className="border border-blue-800 p-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Date</td>
                <td className="border border-blue-800 p-2">Date</td>
                <td className="border border-blue-800 p-2">Date de la vente</td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">ProductID</td>
                <td className="border border-blue-800 p-2">String</td>
                <td className="border border-blue-800 p-2">Identifiant unique du produit</td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Category</td>
                <td className="border border-blue-800 p-2">String</td>
                <td className="border border-blue-800 p-2">Catégorie du produit (Électronique, Vêtements, etc.)</td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">Region</td>
                <td className="border border-blue-800 p-2">String</td>
                <td className="border border-blue-800 p-2">Région de la vente</td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Quantity</td>
                <td className="border border-blue-800 p-2">Integer</td>
                <td className="border border-blue-800 p-2">Quantité vendue</td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">UnitPrice</td>
                <td className="border border-blue-800 p-2">Float</td>
                <td className="border border-blue-800 p-2">Prix unitaire</td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Discount</td>
                <td className="border border-blue-800 p-2">Float</td>
                <td className="border border-blue-800 p-2">Pourcentage de remise</td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">CustomerID</td>
                <td className="border border-blue-800 p-2">String</td>
                <td className="border border-blue-800 p-2">Identifiant du client</td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Promotion</td>
                <td className="border border-blue-800 p-2">Boolean</td>
                <td className="border border-blue-800 p-2">Si le produit était en promotion</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Implémentation</h3>
        <p className="mb-3">Nous allons développer le projet en plusieurs étapes, chacune correspondant à un module du code :</p>
        
        <Tabs defaultValue="data_loader" className="mb-6">
          <TabsList className="bg-blue-900/30 border border-blue-800 mb-2">
            <TabsTrigger value="data_loader">Chargement des données</TabsTrigger>
            <TabsTrigger value="data_analyzer">Analyse</TabsTrigger>
            <TabsTrigger value="data_visualizer">Visualisation</TabsTrigger>
            <TabsTrigger value="sales_predictor">Prédiction</TabsTrigger>
            <TabsTrigger value="main">Application principale</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data_loader" className="mt-0">
            <div className="bg-blue-900/30 rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-2">1. Chargement et nettoyage des données (data_loader.py)</h4>
              <p className="mb-2">Ce module s'occupe de charger les données, de gérer les valeurs manquantes et de transformer le format si nécessaire.</p>
              
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                {`# data_loader.py
import pandas as pd
import numpy as np
from datetime import datetime
import os
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('data_loader')

class DataLoader:
    """
    Classe pour charger et prétraiter les données de ventes.
    """
    
    def __init__(self, data_path):
        """
        Initialise le chargeur de données.
        
        Args:
            data_path: Chemin vers le fichier de données (csv)
        """
        self.data_path = data_path
        self.df = None
        
    def load_data(self):
        """
        Charge les données depuis le fichier.
        
        Returns:
            DataFrame: Les données chargées ou None en cas d'erreur
        """
        try:
            logger.info(f"Chargement des données depuis {self.data_path}")
            
            if not os.path.exists(self.data_path):
                logger.error(f"Le fichier {self.data_path} n'existe pas")
                return None
                
            # Détecter l'extension du fichier
            _, ext = os.path.splitext(self.data_path)
            
            if ext.lower() == '.csv':
                self.df = pd.read_csv(self.data_path, parse_dates=['Date'])
            elif ext.lower() in ['.xlsx', '.xls']:
                self.df = pd.read_excel(self.data_path, parse_dates=['Date'])
            else:
                logger.error(f"Format de fichier non supporté: {ext}")
                return None
                
            logger.info(f"Données chargées avec succès: {len(self.df)} enregistrements")
            return self.df
            
        except Exception as e:
            logger.error(f"Erreur lors du chargement des données: {e}")
            return None
    
    def clean_data(self):
        """
        Nettoie les données en gérant les valeurs manquantes et en corrigeant les formats.
        
        Returns:
            DataFrame: Les données nettoyées
        """
        if self.df is None:
            logger.error("Aucune donnée chargée à nettoyer")
            return None
            
        try:
            logger.info("Début du nettoyage des données")
            
            # Copie pour éviter de modifier l'original
            df_clean = self.df.copy()
            
            # 1. Gestion des valeurs manquantes
            # Compter les valeurs manquantes par colonne
            missing_values = df_clean.isnull().sum()
            logger.info(f"Valeurs manquantes avant nettoyage:\\n{missing_values}")
            
            # Stratégies de gestion selon la colonne
            # Pour les valeurs numériques: remplacer par la médiane
            for col in ['Quantity', 'UnitPrice']:
                if df_clean[col].isnull().any():
                    median_value = df_clean[col].median()
                    df_clean[col].fillna(median_value, inplace=True)
                    logger.info(f"Remplacement des valeurs manquantes dans {col} par la médiane: {median_value}")
            
            # Pour les remises: remplacer par 0 (pas de remise)
            if df_clean['Discount'].isnull().any():
                df_clean['Discount'].fillna(0, inplace=True)
                logger.info("Remplacement des remises manquantes par 0")
            
            # Pour les valeurs catégorielles: utiliser le mode
            for col in ['Category', 'Region']:
                if df_clean[col].isnull().any():
                    mode_value = df_clean[col].mode()[0]
                    df_clean[col].fillna(mode_value, inplace=True)
                    logger.info(f"Remplacement des valeurs manquantes dans {col} par le mode: {mode_value}")
            
            # Pour CustomerID: créer un ID spécial pour les inconnus
            if df_clean['CustomerID'].isnull().any():
                df_clean['CustomerID'].fillna('UNKNOWN', inplace=True)
                logger.info("Remplacement des CustomerID manquants par 'UNKNOWN'")
            
            # Pour Promotion: remplacer par False (pas de promotion)
            if df_clean['Promotion'].isnull().any():
                df_clean['Promotion'].fillna(False, inplace=True)
                logger.info("Remplacement des valeurs Promotion manquantes par False")
            
            # 2. Correction de format et validation
            # S'assurer que les quantités sont des entiers
            df_clean['Quantity'] = df_clean['Quantity'].astype(int)
            
            # S'assurer que les remises sont en pourcentage (entre 0 et 1)
            if df_clean['Discount'].max() > 1:
                logger.info("Normalisation des remises (division par 100)")
                df_clean['Discount'] = df_clean['Discount'] / 100
            
            # 3. Ajout de colonnes calculées
            # Total des ventes (prix après remise)
            df_clean['TotalSales'] = df_clean['Quantity'] * df_clean['UnitPrice'] * (1 - df_clean['Discount'])
            
            # Extraction de caractéristiques temporelles
            df_clean['Year'] = df_clean['Date'].dt.year
            df_clean['Month'] = df_clean['Date'].dt.month
            df_clean['Quarter'] = df_clean['Date'].dt.quarter
            df_clean['DayOfWeek'] = df_clean['Date'].dt.dayofweek
            df_clean['Weekend'] = df_clean['DayOfWeek'].isin([5, 6])  # 5=Samedi, 6=Dimanche
            
            logger.info("Nettoyage des données terminé avec succès")
            
            # Enregistrer les données nettoyées
            self.df_clean = df_clean
            return df_clean
            
        except Exception as e:
            logger.error(f"Erreur lors du nettoyage des données: {e}")
            return None
    
    def save_processed_data(self, output_path):
        """
        Sauvegarde les données nettoyées dans un fichier CSV.
        
        Args:
            output_path: Chemin où sauvegarder le fichier
            
        Returns:
            bool: True si succès, False sinon
        """
        if not hasattr(self, 'df_clean') or self.df_clean is None:
            logger.error("Aucune donnée nettoyée à sauvegarder")
            return False
            
        try:
            # Créer le dossier parent si nécessaire
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Sauvegarder en CSV
            self.df_clean.to_csv(output_path, index=False)
            logger.info(f"Données nettoyées sauvegardées dans {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde des données: {e}")
            return False


# Exemple d'utilisation
if __name__ == "__main__":
    loader = DataLoader("data/raw/sales_data.csv")
    df = loader.load_data()
    
    if df is not None:
        df_clean = loader.clean_data()
        if df_clean is not None:
            loader.save_processed_data("data/processed/sales_clean.csv")
            
            # Afficher quelques statistiques de base
            print("\\nAperçu des données nettoyées:")
            print(df_clean.head())
            
            print("\\nInformations sur les colonnes:")
            print(df_clean.info())
            
            print("\\nStatistiques descriptives:")
            print(df_clean.describe())`}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
          
          <TabsContent value="data_analyzer" className="mt-0">
            <div className="bg-blue-900/30 rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-2">2. Analyse des données (data_analyzer.py)</h4>
              <p className="mb-2">Ce module effectue des analyses statistiques sur les données pour en extraire des informations pertinentes.</p>
              
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                {`# data_analyzer.py
import pandas as pd
import numpy as np
from scipy import stats
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('data_analyzer')

class SalesAnalyzer:
    """
    Classe pour analyser les données de ventes et générer des insights.
    """
    
    def __init__(self, df):
        """
        Initialise l'analyseur avec un DataFrame de données.
        
        Args:
            df: DataFrame pandas contenant les données à analyser
        """
        self.df = df
        logger.info(f"Analyseur initialisé avec {len(df)} enregistrements")
    
    def get_summary_statistics(self):
        """
        Calcule les statistiques descriptives de base.
        
        Returns:
            dict: Dictionnaire contenant les statistiques descriptives
        """
        try:
            # Statistiques numériques
            numeric_stats = self.df.describe(include=[np.number])
            
            # Statistiques catégorielles
            cat_stats = {
                col: self.df[col].value_counts().to_dict()
                for col in ['Category', 'Region']
            }
            
            # Ventes totales
            total_sales = self.df['TotalSales'].sum()
            avg_order_value = self.df.groupby('CustomerID')['TotalSales'].sum().mean()
            
            # Compter les transactions uniques
            transaction_count = len(self.df)
            
            # Produits les plus vendus (top 5)
            top_products = self.df.groupby('ProductID').agg({
                'Quantity': 'sum',
                'TotalSales': 'sum'
            }).sort_values('Quantity', ascending=False).head(5).to_dict()
            
            # Résumé par catégorie
            category_summary = self.df.groupby('Category').agg({
                'TotalSales': 'sum',
                'Quantity': 'sum',
                'ProductID': 'nunique'
            }).rename(columns={'ProductID': 'UniqueProducts'}).to_dict()
            
            # Résumé par région
            region_summary = self.df.groupby('Region').agg({
                'TotalSales': 'sum',
                'CustomerID': 'nunique'
            }).rename(columns={'CustomerID': 'UniqueCustomers'}).to_dict()
            
            # Tendance des ventes par mois
            monthly_trend = self.df.groupby(['Year', 'Month']).agg({
                'TotalSales': 'sum'
            }).reset_index().sort_values(['Year', 'Month']).to_dict('records')
            
            # Impact des promotions
            promo_impact = self.df.groupby('Promotion').agg({
                'TotalSales': ['sum', 'mean'],
                'Quantity': ['sum', 'mean']
            }).to_dict()
            
            results = {
                'numeric_stats': numeric_stats.to_dict(),
                'categorical_stats': cat_stats,
                'total_sales': total_sales,
                'avg_order_value': avg_order_value,
                'transaction_count': transaction_count,
                'top_products': top_products,
                'category_summary': category_summary,
                'region_summary': region_summary,
                'monthly_trend': monthly_trend,
                'promo_impact': promo_impact
            }
            
            logger.info("Statistiques descriptives calculées avec succès")
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors du calcul des statistiques: {e}")
            return None
    
    def analyze_correlations(self):
        """
        Analyse les corrélations entre les variables numériques.
        
        Returns:
            DataFrame: Matrice de corrélation
        """
        try:
            numeric_cols = ['Quantity', 'UnitPrice', 'Discount', 'TotalSales']
            correlations = self.df[numeric_cols].corr()
            
            logger.info("Corrélations calculées avec succès")
            return correlations
            
        except Exception as e:
            logger.error(f"Erreur lors du calcul des corrélations: {e}")
            return None
    
    def analyze_time_series(self):
        """
        Analyse des séries temporelles des ventes.
        
        Returns:
            dict: Résultats d'analyse des séries temporelles
        """
        try:
            # Agréger par jour
            daily_sales = self.df.groupby('Date')['TotalSales'].sum().reset_index()
            daily_sales = daily_sales.set_index('Date').resample('D').sum().fillna(0)
            
            # Agréger par mois
            monthly_sales = self.df.groupby([self.df['Date'].dt.year, self.df['Date'].dt.month])[
                'TotalSales'
            ].sum().reset_index()
            monthly_sales.columns = ['Year', 'Month', 'TotalSales']
            
            # Calculer les tendances (moyenne mobile)
            daily_sales_ma = daily_sales.rolling(window=7).mean()
            
            # Détecter les saisonnalités (par jour de la semaine)
            weekday_sales = self.df.groupby('DayOfWeek')['TotalSales'].agg(['sum', 'mean'])
            
            # Détecter les anomalies (points en dehors de 3 écarts-type)
            daily_mean = daily_sales['TotalSales'].mean()
            daily_std = daily_sales['TotalSales'].std()
            daily_sales['is_anomaly'] = abs(daily_sales['TotalSales'] - daily_mean) > 3 * daily_std
            anomalies = daily_sales[daily_sales['is_anomaly']]
            
            results = {
                'daily_sales': daily_sales.to_dict(),
                'monthly_sales': monthly_sales.to_dict('records'),
                'daily_sales_ma': daily_sales_ma.to_dict(),
                'weekday_pattern': weekday_sales.to_dict(),
                'anomalies': anomalies.to_dict() if not anomalies.empty else {}
            }
            
            logger.info("Analyse de séries temporelles terminée")
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors de l'analyse des séries temporelles: {e}")
            return None
    
    def segment_customers(self, n_clusters=3):
        """
        Segmente les clients en groupes basés sur leurs comportements d'achat.
        
        Args:
            n_clusters: Nombre de clusters à créer
            
        Returns:
            dict: Résultats de la segmentation
        """
        try:
            from sklearn.cluster import KMeans
            from sklearn.preprocessing import StandardScaler
            
            # Agréger les données par client
            customer_stats = self.df.groupby('CustomerID').agg({
                'TotalSales': ['sum', 'mean', 'count'],
                'Quantity': ['sum', 'mean'],
                'Discount': 'mean'
            })
            
            # Aplatir les noms de colonnes multi-index
            customer_stats.columns = ['_'.join(col).strip() for col in customer_stats.columns.values]
            
            # Standardiser les données
            scaler = StandardScaler()
            customer_stats_scaled = scaler.fit_transform(customer_stats)
            
            # Appliquer K-means
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            clusters = kmeans.fit_predict(customer_stats_scaled)
            
            # Ajouter le cluster au DataFrame
            customer_stats['cluster'] = clusters
            
            # Analyser les caractéristiques de chaque cluster
            cluster_analysis = customer_stats.groupby('cluster').mean()
            
            # Compter les clients par cluster
            cluster_counts = customer_stats['cluster'].value_counts().to_dict()
            
            results = {
                'customer_segments': customer_stats.to_dict(),
                'cluster_profiles': cluster_analysis.to_dict(),
                'cluster_counts': cluster_counts
            }
            
            logger.info(f"Segmentation des clients en {n_clusters} groupes terminée")
            return results
            
        except Exception as e:
            logger.error(f"Erreur lors de la segmentation des clients: {e}")
            return None
    
    def find_key_insights(self):
        """
        Identifie les insights clés et recommandations business.
        
        Returns:
            list: Liste d'insights et recommandations
        """
        insights = []
        
        try:
            # 1. Catégories les plus rentables
            cat_profitability = self.df.groupby('Category')['TotalSales'].sum().sort_values(ascending=False)
            top_category = cat_profitability.index[0]
            insights.append({
                'type': 'top_category',
                'insight': f"La catégorie '{top_category}' génère le plus de ventes avec {cat_profitability.iloc[0]:.2f}€",
                'recommendation': f"Considérer l'extension de la gamme de produits dans la catégorie '{top_category}'"
            })
            
            # 2. Impact des promotions
            promo_data = self.df.groupby('Promotion').agg({
                'TotalSales': 'sum',
                'Quantity': 'sum'
            })
            
            promo_impact = (promo_data.loc[True, 'Quantity'] / promo_data.loc[True, 'TotalSales']) / \
                          (promo_data.loc[False, 'Quantity'] / promo_data.loc[False, 'TotalSales'])
            
            if promo_impact > 1.2:  # 20% plus efficace
                insights.append({
                    'type': 'promotion_effective',
                    'insight': "Les promotions augmentent significativement les ventes par rapport au coût",
                    'recommendation': "Augmenter la fréquence des promotions pour stimuler les ventes"
                })
            elif promo_impact < 0.9:  # 10% moins efficace
                insights.append({
                    'type': 'promotion_ineffective',
                    'insight': "Les promotions ne génèrent pas de ventes supplémentaires suffisantes pour justifier la réduction des marges",
                    'recommendation': "Réévaluer la stratégie de promotion ou se concentrer sur des produits spécifiques"
                })
            
            # 3. Tendances temporelles
            monthly_sales = self.df.groupby(self.df['Date'].dt.month)['TotalSales'].sum()
            best_month = monthly_sales.idxmax()
            worst_month = monthly_sales.idxmin()
            
            month_names = {
                1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
                7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
            }
            
            insights.append({
                'type': 'seasonal_pattern',
                'insight': f"Les ventes sont les plus élevées en {month_names[best_month]} et les plus basses en {month_names[worst_month]}",
                'recommendation': f"Planifier des campagnes marketing supplémentaires pour {month_names[worst_month]}"
            })
            
            # 4. Corrélation prix-ventes
            price_qty_corr = self.df[['UnitPrice', 'Quantity']].corr().iloc[0, 1]
            
            if price_qty_corr < -0.3:  # Corrélation négative significative
                insights.append({
                    'type': 'price_sensitive',
                    'insight': "Les clients sont sensibles aux prix (corrélation négative forte entre prix et quantité)",
                    'recommendation': "Envisager des stratégies de prix plus compétitifs ou des offres groupées"
                })
            elif price_qty_corr > 0.3:  # Corrélation positive significative
                insights.append({
                    'type': 'luxury_perception',
                    'insight': "Les produits plus chers se vendent davantage, suggérant une perception de luxe/qualité",
                    'recommendation': "Mettre l'accent sur la qualité et l'exclusivité dans le marketing"
                })
            
            # 5. Régions à fort potentiel
            region_growth = self.df.pivot_table(
                index='Region',
                columns=[self.df['Date'].dt.year, self.df['Date'].dt.quarter],
                values='TotalSales',
                aggfunc='sum'
            ).fillna(0)
            
            # Calculer la croissance de la dernière période (dernier trimestre disponible)
            years = sorted(self.df['Date'].dt.year.unique())
            if len(years) > 1 or (len(years) == 1 and len(self.df['Date'].dt.quarter.unique()) > 1):
                # S'il y a plusieurs années ou plusieurs trimestres dans une année
                if len(years) > 1:
                    last_year, prev_year = years[-1], years[-2]
                    last_q = self.df[self.df['Date'].dt.year == last_year]['Date'].dt.quarter.max()
                    prev_q = 4  # Dernier trimestre de l'année précédente
                else:
                    last_year = prev_year = years[0]
                    quarters = sorted(self.df['Date'].dt.quarter.unique())
                    last_q, prev_q = quarters[-1], quarters[-2]
                
                try:
                    region_growth['growth'] = (
                        region_growth[(last_year, last_q)] - region_growth[(prev_year, prev_q)]
                    ) / region_growth[(prev_year, prev_q)]
                    
                    # Trouver la région avec la plus forte croissance
                    top_growth_region = region_growth['growth'].idxmax()
                    growth_pct = region_growth.loc[top_growth_region, 'growth'] * 100
                    
                    insights.append({
                        'type': 'regional_growth',
                        'insight': f"La région '{top_growth_region}' montre la plus forte croissance ({growth_pct:.1f}%)",
                        'recommendation': f"Augmenter l'investissement marketing et la distribution dans la région '{top_growth_region}'"
                    })
                except:
                    # En cas d'erreur dans le calcul de croissance, ignorer cet insight
                    pass
            
            # 6. Autres insights potentiels
            # ...
            
            logger.info(f"Génération de {len(insights)} insights clés terminée")
            return insights
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche d'insights: {e}")
            # Retourner les insights déjà trouvés, même en cas d'erreur partielle
            return insights


# Exemple d'utilisation
if __name__ == "__main__":
    # Supposons que les données sont déjà chargées et nettoyées
    from data_loader import DataLoader
    
    loader = DataLoader("data/raw/sales_data.csv")
    df = loader.load_data()
    
    if df is not None:
        df_clean = loader.clean_data()
        if df_clean is not None:
            analyzer = SalesAnalyzer(df_clean)
            
            # Obtenir des statistiques descriptives
            stats = analyzer.get_summary_statistics()
            print("\\nTotal des ventes:", stats['total_sales'])
            
            # Analyser les corrélations
            corr = analyzer.analyze_correlations()
            print("\\nMatrice de corrélations:")
            print(corr)
            
            # Trouver des insights
            insights = analyzer.find_key_insights()
            print("\\nInsights clés:")
            for i, insight in enumerate(insights, 1):
                print(f"{i}. {insight['insight']}")
                print(f"   Recommandation: {insight['recommendation']}")`}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
          
          <TabsContent value="data_visualizer" className="mt-0">
            <div className="bg-blue-900/30 rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-2">3. Visualisation des données (data_visualizer.py)</h4>
              <p className="mb-2">Ce module crée des visualisations à partir des données analysées pour faciliter la compréhension des tendances et patterns.</p>
              
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                {`# data_visualizer.py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import logging
from datetime import datetime

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('data_visualizer')

class SalesVisualizer:
    """
    Classe pour créer des visualisations à partir des données de ventes.
    """
    
    def __init__(self, df, output_dir='output/figures'):
        """
        Initialise le visualiseur avec un DataFrame de données.
        
        Args:
            df: DataFrame pandas contenant les données à visualiser
            output_dir: Répertoire où sauvegarder les figures générées
        """
        self.df = df
        self.output_dir = output_dir
        
        # Créer le répertoire de sortie s'il n'existe pas
        os.makedirs(output_dir, exist_ok=True)
        
        # Configurer le style de seaborn
        sns.set(style='whitegrid')
        sns.set_palette('viridis')
        
        logger.info(f"Visualiseur initialisé avec {len(df)} enregistrements")
    
    def save_figure(self, fig, filename):
        """
        Sauvegarde une figure matplotlib.
        
        Args:
            fig: Figure matplotlib
            filename: Nom du fichier sans extension
            
        Returns:
            str: Chemin complet du fichier sauvegardé
        """
        filepath = os.path.join(self.output_dir, f"{filename}.png")
        fig.savefig(filepath, bbox_inches='tight', dpi=300)
        plt.close(fig)
        logger.info(f"Figure sauvegardée: {filepath}")
        return filepath
    
    def plot_sales_trend(self):
        """
        Crée un graphique de tendance des ventes au fil du temps.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les ventes par jour
            daily_sales = self.df.groupby('Date')['TotalSales'].sum().reset_index()
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Tracer la tendance
            ax.plot(daily_sales['Date'], daily_sales['TotalSales'], 
                   marker='o', linestyle='-', alpha=0.7, markersize=4)
            
            # Ajouter une moyenne mobile sur 7 jours
            daily_sales['MA7'] = daily_sales['TotalSales'].rolling(window=7).mean()
            ax.plot(daily_sales['Date'], daily_sales['MA7'], 
                   color='red', linestyle='-', linewidth=2, label='Moyenne mobile (7 jours)')
            
            # Mettre en forme le graphique
            ax.set_title('Évolution des ventes au fil du temps', fontsize=16)
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('Ventes totales (€)', fontsize=12)
            ax.grid(True, linestyle='--', alpha=0.7)
            ax.legend()
            
            # Rotation des dates sur l'axe X pour meilleure lisibilité
            plt.xticks(rotation=45)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'sales_trend')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique de tendance: {e}")
            return None
    
    def plot_sales_by_category(self):
        """
        Crée un graphique comparant les ventes par catégorie de produit.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les ventes par catégorie
            cat_sales = self.df.groupby('Category')['TotalSales'].sum().sort_values(ascending=False)
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(10, 8))
            
            # Tracer le graphique à barres
            bars = sns.barplot(x=cat_sales.values, y=cat_sales.index, ax=ax)
            
            # Ajouter les valeurs sur les barres
            for i, v in enumerate(cat_sales.values):
                ax.text(v + 0.1, i, f'{v:,.2f}€', va='center')
            
            # Mettre en forme le graphique
            ax.set_title('Ventes totales par catégorie', fontsize=16)
            ax.set_xlabel('Ventes totales (€)', fontsize=12)
            ax.set_ylabel('Catégorie', fontsize=12)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'sales_by_category')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique par catégorie: {e}")
            return None
    
    def plot_sales_heatmap(self):
        """
        Crée une heatmap des ventes par mois et par an.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les ventes par mois et année
            monthly_sales = self.df.pivot_table(
                index=self.df['Date'].dt.month,
                columns=self.df['Date'].dt.year,
                values='TotalSales',
                aggfunc='sum'
            )
            
            # Renommer les index de mois
            month_names = {
                1: 'Jan', 2: 'Fév', 3: 'Mar', 4: 'Avr', 5: 'Mai', 6: 'Jun',
                7: 'Jul', 8: 'Aoû', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Déc'
            }
            monthly_sales.index = [month_names[i] for i in monthly_sales.index]
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(10, 8))
            
            # Tracer la heatmap
            sns.heatmap(monthly_sales, annot=True, fmt='.0f', cmap='viridis', ax=ax)
            
            # Mettre en forme le graphique
            ax.set_title('Ventes mensuelles par année', fontsize=16)
            ax.set_ylabel('Mois', fontsize=12)
            ax.set_xlabel('Année', fontsize=12)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'sales_heatmap')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création de la heatmap: {e}")
            return None
    
    def plot_category_distribution(self):
        """
        Crée un graphique en camembert montrant la distribution des ventes par catégorie.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les ventes par catégorie
            cat_sales = self.df.groupby('Category')['TotalSales'].sum()
            
            # Calculer les pourcentages
            cat_pcts = (cat_sales / cat_sales.sum()) * 100
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(10, 8))
            
            # Tracer le graphique en camembert
            wedges, texts, autotexts = ax.pie(
                cat_sales,
                labels=cat_sales.index,
                autopct='%1.1f%%',
                startangle=90,
                shadow=False,
            )
            
            # Égaliser les axes pour que le cercle soit rond
            ax.axis('equal')
            
            # Personnaliser les textes
            for text in texts:
                text.set_fontsize(12)
            for autotext in autotexts:
                autotext.set_fontsize(10)
                autotext.set_color('white')
            
            # Ajouter un titre
            plt.title('Répartition des ventes par catégorie', fontsize=16)
            
            # Ajouter une légende
            plt.legend(
                title="Catégories",
                loc="center left",
                bbox_to_anchor=(1, 0, 0.5, 1)
            )
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'category_distribution')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique de distribution: {e}")
            return None
    
    def plot_correlation_matrix(self):
        """
        Crée une matrice de corrélation entre les variables numériques.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Sélectionner les colonnes numériques pertinentes
            numeric_cols = ['Quantity', 'UnitPrice', 'Discount', 'TotalSales']
            corr_matrix = self.df[numeric_cols].corr()
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(10, 8))
            
            # Tracer la heatmap de corrélation
            sns.heatmap(
                corr_matrix,
                annot=True,
                cmap='coolwarm',
                vmin=-1,
                vmax=1,
                center=0,
                square=True,
                linewidths=.5,
                cbar_kws={"shrink": .8},
                ax=ax
            )
            
            # Mettre en forme le graphique
            ax.set_title('Matrice de corrélation des variables', fontsize=16)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'correlation_matrix')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création de la matrice de corrélation: {e}")
            return None
    
    def plot_weekday_sales(self):
        """
        Crée un graphique montrant les ventes par jour de la semaine.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les ventes par jour de la semaine
            weekday_sales = self.df.groupby('DayOfWeek')['TotalSales'].agg(['sum', 'mean'])
            
            # Convertir les indices numériques en noms de jours
            day_names = {
                0: 'Lundi', 1: 'Mardi', 2: 'Mercredi', 3: 'Jeudi',
                4: 'Vendredi', 5: 'Samedi', 6: 'Dimanche'
            }
            weekday_sales.index = [day_names[i] for i in weekday_sales.index]
            
            # Créer la figure avec deux sous-graphiques
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
            
            # Graphique 1: Ventes totales par jour
            sns.barplot(x=weekday_sales.index, y=weekday_sales['sum'], ax=ax1)
            ax1.set_title('Ventes totales par jour de la semaine', fontsize=14)
            ax1.set_xlabel('Jour de la semaine', fontsize=12)
            ax1.set_ylabel('Ventes totales (€)', fontsize=12)
            ax1.tick_params(axis='x', rotation=45)
            
            # Graphique 2: Ventes moyennes par jour
            sns.barplot(x=weekday_sales.index, y=weekday_sales['mean'], ax=ax2)
            ax2.set_title('Ventes moyennes par jour de la semaine', fontsize=14)
            ax2.set_xlabel('Jour de la semaine', fontsize=12)
            ax2.set_ylabel('Ventes moyennes (€)', fontsize=12)
            ax2.tick_params(axis='x', rotation=45)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'weekday_sales')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique des ventes par jour: {e}")
            return None
    
    def plot_promotion_impact(self):
        """
        Crée un graphique comparant les ventes avec et sans promotion.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les données par promotion
            promo_impact = self.df.groupby('Promotion').agg({
                'TotalSales': ['sum', 'mean', 'count'],
                'Quantity': ['sum', 'mean'],
                'Discount': 'mean'
            })
            
            # Aplatir les noms de colonnes multi-index
            promo_impact.columns = ['_'.join(col).strip() for col in promo_impact.columns.values]
            
            # Créer la figure avec quatre sous-graphiques
            fig, axes = plt.subplots(2, 2, figsize=(15, 12))
            
            # Graphique 1: Ventes totales
            sns.barplot(
                x=promo_impact.index.map({True: 'Avec promotion', False: 'Sans promotion'}),
                y=promo_impact['TotalSales_sum'],
                ax=axes[0, 0]
            )
            axes[0, 0].set_title('Ventes totales', fontsize=14)
            axes[0, 0].set_ylabel('Ventes (€)', fontsize=12)
            axes[0, 0].set_xlabel('')
            
            # Graphique 2: Ventes moyennes par transaction
            sns.barplot(
                x=promo_impact.index.map({True: 'Avec promotion', False: 'Sans promotion'}),
                y=promo_impact['TotalSales_mean'],
                ax=axes[0, 1]
            )
            axes[0, 1].set_title('Ventes moyennes par transaction', fontsize=14)
            axes[0, 1].set_ylabel('Ventes moyennes (€)', fontsize=12)
            axes[0, 1].set_xlabel('')
            
            # Graphique 3: Quantité totale
            sns.barplot(
                x=promo_impact.index.map({True: 'Avec promotion', False: 'Sans promotion'}),
                y=promo_impact['Quantity_sum'],
                ax=axes[1, 0]
            )
            axes[1, 0].set_title('Quantité totale vendue', fontsize=14)
            axes[1, 0].set_ylabel('Unités', fontsize=12)
            axes[1, 0].set_xlabel('')
            
            # Graphique 4: Quantité moyenne par transaction
            sns.barplot(
                x=promo_impact.index.map({True: 'Avec promotion', False: 'Sans promotion'}),
                y=promo_impact['Quantity_mean'],
                ax=axes[1, 1]
            )
            axes[1, 1].set_title('Quantité moyenne par transaction', fontsize=14)
            axes[1, 1].set_ylabel('Unités', fontsize=12)
            axes[1, 1].set_xlabel('')
            
            # Titre global
            plt.suptitle('Impact des promotions sur les ventes', fontsize=16, y=1.02)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'promotion_impact')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique d'impact des promotions: {e}")
            return None
    
    def plot_regional_sales(self):
        """
        Crée une carte de chaleur des ventes par région.
        
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            # Agréger les ventes par région
            region_sales = self.df.groupby('Region')['TotalSales'].sum().sort_values(ascending=False)
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(12, 8))
            
            # Tracer le graphique à barres horizontal
            bars = sns.barplot(x=region_sales.values, y=region_sales.index, palette='viridis', ax=ax)
            
            # Ajouter les valeurs sur les barres
            for i, v in enumerate(region_sales.values):
                ax.text(v + 0.1, i, f'{v:,.2f}€', va='center')
            
            # Mettre en forme le graphique
            ax.set_title('Ventes totales par région', fontsize=16)
            ax.set_xlabel('Ventes totales (€)', fontsize=12)
            ax.set_ylabel('Région', fontsize=12)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            return self.save_figure(fig, 'regional_sales')
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique régional: {e}")
            return None
    
    def create_all_visualizations(self):
        """
        Crée toutes les visualisations et retourne les chemins.
        
        Returns:
            list: Liste des chemins des figures générées
        """
        figures = []
        
        # Générer toutes les visualisations
        figures.append(self.plot_sales_trend())
        figures.append(self.plot_sales_by_category())
        figures.append(self.plot_sales_heatmap())
        figures.append(self.plot_category_distribution())
        figures.append(self.plot_correlation_matrix())
        figures.append(self.plot_weekday_sales())
        figures.append(self.plot_promotion_impact())
        figures.append(self.plot_regional_sales())
        
        # Filtrer les chemins None (en cas d'erreur)
        figures = [f for f in figures if f is not None]
        
        logger.info(f"Génération de {len(figures)} visualisations terminée")
        return figures


# Exemple d'utilisation
if __name__ == "__main__":
    # Supposons que les données sont déjà chargées et nettoyées
    from data_loader import DataLoader
    
    loader = DataLoader("data/raw/sales_data.csv")
    df = loader.load_data()
    
    if df is not None:
        df_clean = loader.clean_data()
        if df_clean is not None:
            visualizer = SalesVisualizer(df_clean)
            figures = visualizer.create_all_visualizations()
            
            print(f"Généré {len(figures)} visualisations:")
            for fig_path in figures:
                print(f"- {fig_path}")`}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
          
          <TabsContent value="sales_predictor" className="mt-0">
            <div className="bg-blue-900/30 rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-2">4. Prédiction des ventes (sales_predictor.py)</h4>
              <p className="mb-2">Ce module utilise des algorithmes de machine learning pour prédire les ventes futures.</p>
              
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                {`# sales_predictor.py
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import logging
from datetime import datetime, timedelta

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('sales_predictor')

class SalesPredictor:
    """
    Classe pour la prédiction des ventes futures avec des modèles de machine learning.
    """
    
    def __init__(self, df, output_dir='output/models'):
        """
        Initialise le prédicteur avec un DataFrame de données.
        
        Args:
            df: DataFrame pandas contenant les données historiques
            output_dir: Répertoire où sauvegarder les modèles entraînés
        """
        self.df = df
        self.output_dir = output_dir
        self.models = {}
        self.best_model = None
        self.feature_importance = None
        
        # Créer le répertoire de sortie s'il n'existe pas
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Prédicteur initialisé avec {len(df)} enregistrements")
    
    def prepare_features(self, target_col='TotalSales', group_by=None):
        """
        Prépare les caractéristiques et la cible pour l'entraînement.
        
        Args:
            target_col: Nom de la colonne cible à prédire
            group_by: Liste de colonnes pour grouper les données (si None, utilise les données brutes)
        
        Returns:
            tuple: (X, y) avec caractéristiques et cible
        """
        try:
            if group_by is not None:
                # Agréger les données selon group_by
                df_agg = self.df.groupby(group_by)[target_col].sum().reset_index()
                logger.info(f"Données agrégées par {group_by}: {len(df_agg)} enregistrements")
                working_df = df_agg
            else:
                working_df = self.df
            
            # Sélectionner et préparer les caractéristiques
            # Note: Pour une prédiction de série temporelle, nous utilisons ici une approche simplifiée
            if 'Date' in working_df.columns:
                # Extraire les caractéristiques temporelles si la date est disponible
                if 'Year' not in working_df.columns:
                    working_df['Year'] = working_df['Date'].dt.year
                if 'Month' not in working_df.columns:
                    working_df['Month'] = working_df['Date'].dt.month
                if 'Quarter' not in working_df.columns:
                    working_df['Quarter'] = working_df['Date'].dt.quarter
                if 'DayOfWeek' not in working_df.columns:
                    working_df['DayOfWeek'] = working_df['Date'].dt.dayofweek
                if 'DayOfMonth' not in working_df.columns:
                    working_df['DayOfMonth'] = working_df['Date'].dt.day
            
            # Sélectionner les colonnes pertinentes pour la prédiction
            # Exclure les colonnes non pertinentes ou qui causeraient des fuites d'information
            exclude_cols = ['Date', target_col, 'CustomerID', 'ProductID']
            feature_cols = [col for col in working_df.columns if col not in exclude_cols]
            
            # Créer X et y
            X = working_df[feature_cols]
            y = working_df[target_col]
            
            logger.info(f"Caractéristiques préparées: {X.shape[1]} colonnes, {X.shape[0]} lignes")
            
            # Stocker les colonnes pour une utilisation ultérieure
            self.feature_cols = feature_cols
            self.target_col = target_col
            
            return X, y
            
        except Exception as e:
            logger.error(f"Erreur lors de la préparation des caractéristiques: {e}")
            return None, None
    
    def build_and_train_models(self, X, y, test_size=0.2, time_series=False):
        """
        Construit et entraîne plusieurs modèles de prédiction.
        
        Args:
            X: Caractéristiques
            y: Cible
            test_size: Proportion de données pour le test
            time_series: Si True, utilise une validation temporelle
            
        Returns:
            dict: Résultats d'évaluation des modèles
        """
        try:
            if X is None or y is None:
                return None
            
            # Identifier les types de colonnes
            numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
            categorical_features = X.select_dtypes(include=['object', 'bool', 'category']).columns.tolist()
            
            # Créer des transformateurs pour chaque type
            numeric_transformer = Pipeline(steps=[
                ('scaler', StandardScaler())
            ])
            
            categorical_transformer = Pipeline(steps=[
                ('onehot', OneHotEncoder(handle_unknown='ignore'))
            ])
            
            # Combiner les transformateurs
            preprocessor = ColumnTransformer(
                transformers=[
                    ('num', numeric_transformer, numeric_features),
                    ('cat', categorical_transformer, categorical_features)
                ]
            )
            
            # Définir les modèles à tester
            models_to_train = {
                'LinearRegression': LinearRegression(),
                'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42),
                'GradientBoosting': GradientBoostingRegressor(n_estimators=100, random_state=42)
            }
            
            # Évaluation spécifique pour les séries temporelles
            if time_series:
                logger.info("Utilisation de la validation temporelle")
                
                # Trier les données par ordre chronologique
                # Note: Cela suppose que les données sont déjà triées si nous utilisons des données agrégées
                
                # Utiliser TimeSeriesSplit pour la validation croisée temporelle
                tscv = TimeSeriesSplit(n_splits=5)
                
                results = {}
                for name, model in models_to_train.items():
                    logger.info(f"Entraînement du modèle {name} avec validation temporelle")
                    
                    # Créer le pipeline complet
                    pipeline = Pipeline(steps=[
                        ('preprocessor', preprocessor),
                        ('model', model)
                    ])
                    
                    # Cross-validation temporelle
                    cv_scores = cross_val_score(
                        pipeline, X, y, cv=tscv, scoring='neg_mean_squared_error'
                    )
                    
                    # Convertir RMSE négatif en positif
                    rmse_scores = np.sqrt(-cv_scores)
                    
                    # Enregistrer les résultats
                    results[name] = {
                        'mean_rmse': rmse_scores.mean(),
                        'std_rmse': rmse_scores.std(),
                        'all_scores': rmse_scores
                    }
                    
                    # Entraîner sur l'ensemble des données
                    pipeline.fit(X, y)
                    
                    # Sauvegarder le modèle
                    self.models[name] = pipeline
                    
                    # Sauvegarder le fichier du modèle
                    model_path = os.path.join(self.output_dir, f"{name}_model.joblib")
                    joblib.dump(pipeline, model_path)
                    logger.info(f"Modèle {name} sauvegardé: {model_path}")
                
                # Identifier le meilleur modèle
                best_model_name = min(results, key=lambda k: results[k]['mean_rmse'])
                self.best_model = best_model_name
                results['best_model'] = best_model_name
                
                logger.info(f"Meilleur modèle: {best_model_name} avec RMSE: {results[best_model_name]['mean_rmse']:.2f}")
                
                # Extraire l'importance des caractéristiques si disponible
                if hasattr(models_to_train[best_model_name], 'feature_importances_'):
                    # Récupérer les noms des caractéristiques après transformation
                    preprocessor = self.models[best_model_name].named_steps['preprocessor']
                    model = self.models[best_model_name].named_steps['model']
                    
                    # Cette partie est complexe car OneHotEncoder change les noms des colonnes
                    # Une approche simplifiée est utilisée ici
                    self.feature_importance = {
                        'model': best_model_name,
                        'importances': model.feature_importances_
                    }
                
                return results
                
            else:
                # Approche classique avec train/test split
                logger.info("Utilisation de la validation train/test split")
                
                # Diviser les données
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=test_size, random_state=42
                )
                
                results = {}
                for name, model in models_to_train.items():
                    logger.info(f"Entraînement du modèle {name}")
                    
                    # Créer le pipeline complet
                    pipeline = Pipeline(steps=[
                        ('preprocessor', preprocessor),
                        ('model', model)
                    ])
                    
                    # Entraîner le modèle
                    pipeline.fit(X_train, y_train)
                    
                    # Prédire sur l'ensemble de test
                    y_pred = pipeline.predict(X_test)
                    
                    # Évaluer les performances
                    mae = mean_absolute_error(y_test, y_pred)
                    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                    r2 = r2_score(y_test, y_pred)
                    
                    # Enregistrer les résultats
                    results[name] = {
                        'mae': mae,
                        'rmse': rmse,
                        'r2': r2,
                        'y_true': y_test,
                        'y_pred': y_pred
                    }
                    
                    # Sauvegarder le modèle
                    self.models[name] = pipeline
                    
                    # Sauvegarder le fichier du modèle
                    model_path = os.path.join(self.output_dir, f"{name}_model.joblib")
                    joblib.dump(pipeline, model_path)
                    logger.info(f"Modèle {name} sauvegardé: {model_path}")
                
                # Identifier le meilleur modèle (basé sur RMSE)
                best_model_name = min(results, key=lambda k: results[k]['rmse'])
                self.best_model = best_model_name
                results['best_model'] = best_model_name
                
                logger.info(f"Meilleur modèle: {best_model_name} avec RMSE: {results[best_model_name]['rmse']:.2f}")
                
                # Extraire l'importance des caractéristiques si disponible
                if hasattr(models_to_train[best_model_name], 'feature_importances_'):
                    # Essayer de récupérer les importances (cela peut être complexe avec le pipeline)
                    # Une approche simplifiée est utilisée ici
                    model = self.models[best_model_name].named_steps['model']
                    self.feature_importance = {
                        'model': best_model_name,
                        'importances': model.feature_importances_
                    }
                
                return results
                
        except Exception as e:
            logger.error(f"Erreur lors de l'entraînement des modèles: {e}")
            return None
    
    def plot_model_comparison(self, results, output_dir='output/figures'):
        """
        Crée des visualisations pour comparer les performances des modèles.
        
        Args:
            results: Résultats d'évaluation des modèles
            output_dir: Répertoire où sauvegarder les figures
            
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            if results is None or 'best_model' not in results:
                return None
            
            # Créer le répertoire de sortie s'il n'existe pas
            os.makedirs(output_dir, exist_ok=True)
            
            # Comparer les modèles selon leur RMSE
            model_names = [name for name in results if name != 'best_model']
            
            if 'mean_rmse' in results[model_names[0]]:
                # Cas des résultats de validation temporelle
                rmse_values = [results[name]['mean_rmse'] for name in model_names]
                rmse_std = [results[name]['std_rmse'] for name in model_names]
                
                # Créer la figure
                fig, ax = plt.subplots(figsize=(10, 6))
                
                # Tracer les barres avec erreur standard
                bars = ax.bar(model_names, rmse_values, yerr=rmse_std, capsize=10,
                            color=['green' if name == results['best_model'] else 'skyblue' for name in model_names])
                
                # Mettre en forme le graphique
                ax.set_title('Comparaison des modèles (RMSE)', fontsize=16)
                ax.set_xlabel('Modèle', fontsize=12)
                ax.set_ylabel('RMSE (Erreur)', fontsize=12)
                ax.grid(axis='y', linestyle='--', alpha=0.7)
                
                # Ajouter les valeurs sur les barres
                for i, v in enumerate(rmse_values):
                    ax.text(i, v + 0.1, f'{v:.2f}', ha='center', va='bottom')
                
                # Marquer le meilleur modèle
                ax.text(model_names.index(results['best_model']), 0, 'Meilleur modèle',
                      ha='center', va='bottom', rotation=90, color='darkgreen')
                
            else:
                # Cas des résultats de train/test split
                rmse_values = [results[name]['rmse'] for name in model_names]
                r2_values = [results[name]['r2'] for name in model_names]
                
                # Créer la figure avec deux sous-graphiques
                fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
                
                # Graphique 1: RMSE (plus bas = meilleur)
                bars1 = ax1.bar(model_names, rmse_values,
                              color=['green' if name == results['best_model'] else 'skyblue' for name in model_names])
                ax1.set_title('Comparaison des modèles (RMSE)', fontsize=14)
                ax1.set_xlabel('Modèle', fontsize=12)
                ax1.set_ylabel('RMSE (Erreur)', fontsize=12)
                ax1.grid(axis='y', linestyle='--', alpha=0.7)
                
                # Ajouter les valeurs sur les barres
                for i, v in enumerate(rmse_values):
                    ax1.text(i, v + 0.1, f'{v:.2f}', ha='center', va='bottom')
                
                # Graphique 2: R² (plus haut = meilleur)
                bars2 = ax2.bar(model_names, r2_values,
                              color=['green' if name == results['best_model'] else 'skyblue' for name in model_names])
                ax2.set_title('Comparaison des modèles (R²)', fontsize=14)
                ax2.set_xlabel('Modèle', fontsize=12)
                ax2.set_ylabel('R² (Coefficient de détermination)', fontsize=12)
                ax2.grid(axis='y', linestyle='--', alpha=0.7)
                
                # Ajouter les valeurs sur les barres
                for i, v in enumerate(r2_values):
                    ax2.text(i, v + 0.01, f'{v:.2f}', ha='center', va='bottom')
                
                # Marquer le meilleur modèle
                ax1.text(model_names.index(results['best_model']), 0, 'Meilleur modèle',
                       ha='center', va='bottom', rotation=90, color='darkgreen')
                ax2.text(model_names.index(results['best_model']), 0, 'Meilleur modèle',
                       ha='center', va='bottom', rotation=90, color='darkgreen')
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            filepath = os.path.join(output_dir, "model_comparison.png")
            plt.savefig(filepath, bbox_inches='tight', dpi=300)
            plt.close(fig)
            
            logger.info(f"Comparaison des modèles sauvegardée: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique de comparaison: {e}")
            return None
    
    def plot_actual_vs_predicted(self, results, output_dir='output/figures'):
        """
        Crée un graphique des valeurs réelles vs prédites pour le meilleur modèle.
        
        Args:
            results: Résultats d'évaluation des modèles
            output_dir: Répertoire où sauvegarder les figures
            
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            if results is None or 'best_model' not in results:
                return None
            
            # Créer le répertoire de sortie s'il n'existe pas
            os.makedirs(output_dir, exist_ok=True)
            
            # Cas de validation train/test standard uniquement
            if 'y_true' not in results[results['best_model']]:
                logger.info("Graphique réel vs prédit non disponible pour la validation temporelle")
                return None
            
            best_model = results['best_model']
            y_true = results[best_model]['y_true']
            y_pred = results[best_model]['y_pred']
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(10, 8))
            
            # Tracer le nuage de points
            ax.scatter(y_true, y_pred, alpha=0.6)
            
            # Ajouter une ligne diagonale parfaite (y=x)
            max_val = max(max(y_true), max(y_pred))
            min_val = min(min(y_true), min(y_pred))
            ax.plot([min_val, max_val], [min_val, max_val], 'r--')
            
            # Mettre en forme le graphique
            ax.set_title(f'Valeurs réelles vs prédites ({best_model})', fontsize=16)
            ax.set_xlabel('Valeurs réelles', fontsize=12)
            ax.set_ylabel('Valeurs prédites', fontsize=12)
            ax.grid(True, linestyle='--', alpha=0.7)
            
            # Ajouter les métriques
            rmse = results[best_model]['rmse']
            r2 = results[best_model]['r2']
            ax.text(0.05, 0.95, f'RMSE: {rmse:.2f}\\nR²: {r2:.2f}',
                  transform=ax.transAxes, fontsize=12,
                  bbox=dict(facecolor='white', alpha=0.8))
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            filepath = os.path.join(output_dir, "actual_vs_predicted.png")
            plt.savefig(filepath, bbox_inches='tight', dpi=300)
            plt.close(fig)
            
            logger.info(f"Graphique réel vs prédit sauvegardé: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique réel vs prédit: {e}")
            return None
    
    def predict_future(self, periods=12, freq='M', group_by=None):
        """
        Génère des prédictions pour des périodes futures.
        
        Args:
            periods: Nombre de périodes à prédire
            freq: Fréquence des périodes ('D'=jours, 'W'=semaines, 'M'=mois)
            group_by: Colonnes pour grouper les prédictions (doit correspondre à l'entraînement)
            
        Returns:
            DataFrame: Prédictions pour les périodes futures
        """
        try:
            if self.best_model is None or self.best_model not in self.models:
                logger.error("Aucun modèle entraîné disponible pour la prédiction")
                return None
            
            # Récupérer le modèle
            model = self.models[self.best_model]
            
            # Préparer les données futures
            # Note: Cette partie est très dépendante de la structure des données et 
            # de la manière dont le modèle a été entraîné
            
            # Calculer la date de début pour les prédictions (jour suivant la dernière date)
            if 'Date' in self.df.columns:
                last_date = self.df['Date'].max()
                if freq == 'D':
                    next_date = last_date + timedelta(days=1)
                    date_range = pd.date_range(start=next_date, periods=periods, freq='D')
                elif freq == 'W':
                    # Arrondir à la semaine suivante
                    next_date = last_date + timedelta(days=(7 - last_date.weekday()))
                    date_range = pd.date_range(start=next_date, periods=periods, freq='W-MON')
                elif freq == 'M':
                    # Calculer le premier jour du mois suivant
                    if last_date.month == 12:
                        next_date = datetime(last_date.year + 1, 1, 1)
                    else:
                        next_date = datetime(last_date.year, last_date.month + 1, 1)
                    date_range = pd.date_range(start=next_date, periods=periods, freq='MS')
                else:
                    logger.error(f"Fréquence non supportée: {freq}")
                    return None
                
                logger.info(f"Prédiction de {periods} périodes futures à partir de {next_date}")
                
                # Créer un DataFrame pour les dates futures
                future_df = pd.DataFrame({'Date': date_range})
                
                # Extraire les caractéristiques temporelles
                future_df['Year'] = future_df['Date'].dt.year
                future_df['Month'] = future_df['Date'].dt.month
                future_df['Quarter'] = future_df['Date'].dt.quarter
                future_df['DayOfWeek'] = future_df['Date'].dt.dayofweek
                future_df['DayOfMonth'] = future_df['Date'].dt.day
                
                # Si un groupement est spécifié, nous devons adapter notre approche
                if group_by is not None:
                    # Vérifier que group_by contient uniquement des colonnes temporelles
                    valid_temporal = all(col in ['Year', 'Month', 'Quarter', 'DayOfWeek', 'DayOfMonth'] 
                                      for col in group_by)
                    if not valid_temporal:
                        logger.error("Pour la prédiction future, group_by doit contenir uniquement des colonnes temporelles")
                        return None
                    
                    # Nous utilisons uniquement les colonnes de group_by pour l'agrégation
                    future_features = future_df[group_by].drop_duplicates()
                    
                else:
                    # Cas sans agrégation: une ligne par date future
                    future_features = future_df
                
                # Ajouter des colonnes supplémentaires (moyennes, valeurs les plus fréquentes)
                for col in self.feature_cols:
                    if col not in future_features.columns:
                        if col in ['Year', 'Month', 'Quarter', 'DayOfWeek', 'DayOfMonth', 'Weekend']:
                            # Déjà ajouté ou sera dérivé
                            continue
                        elif self.df[col].dtype in ['int64', 'float64']:
                            # Pour les colonnes numériques, utiliser la moyenne
                            future_features[col] = self.df[col].mean()
                        else:
                            # Pour les colonnes catégorielles, utiliser la valeur la plus fréquente
                            future_features[col] = self.df[col].mode()[0]
                
                # Ajouter Weekend si nécessaire et dans les caractéristiques
                if 'Weekend' in self.feature_cols and 'Weekend' not in future_features.columns:
                    if 'DayOfWeek' in future_features.columns:
                        future_features['Weekend'] = future_features['DayOfWeek'].isin([5, 6])
                
                # Garder uniquement les colonnes utilisées pendant l'entraînement
                future_X = future_features[self.feature_cols]
                
                # Faire les prédictions
                future_pred = model.predict(future_X)
                
                # Ajouter les prédictions au DataFrame
                if group_by is not None:
                    result_df = future_features.copy()
                    result_df[self.target_col] = future_pred
                    
                    # Ajouter les dates complètes si pertinent
                    if all(g in ['Year', 'Month'] for g in group_by):
                        # Créer des dates représentatives (premier jour du mois)
                        result_df['Date'] = pd.to_datetime(
                            result_df['Year'].astype(str) + '-' + result_df['Month'].astype(str) + '-01'
                        )
                else:
                    result_df = future_df.copy()
                    result_df[self.target_col] = future_pred
                
                logger.info(f"Prédictions générées: {len(result_df)} lignes")
                return result_df
                
            else:
                logger.error("Impossible de générer des prédictions futures sans colonne Date")
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de la prédiction future: {e}")
            return None
    
    def plot_future_predictions(self, predictions, historical=None, output_dir='output/figures'):
        """
        Crée un graphique des prédictions futures.
        
        Args:
            predictions: DataFrame contenant les prédictions
            historical: DataFrame contenant les données historiques (optionnel)
            output_dir: Répertoire où sauvegarder les figures
            
        Returns:
            str: Chemin du fichier sauvegardé
        """
        try:
            if predictions is None:
                return None
            
            # Créer le répertoire de sortie s'il n'existe pas
            os.makedirs(output_dir, exist_ok=True)
            
            # Créer la figure
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Tracer les prédictions
            if 'Date' in predictions.columns:
                # Cas avec dates
                ax.plot(predictions['Date'], predictions[self.target_col], 
                      marker='o', linestyle='-', color='red', label='Prédictions')
                
                # Ajouter les données historiques si disponibles
                if historical is not None and 'Date' in historical.columns:
                    # Agréger les données historiques si nécessaire
                    if 'group_by' in historical.attrs and historical.attrs['group_by'] is not None:
                        group_cols = historical.attrs['group_by']
                        if all(col in historical.columns for col in group_cols):
                            hist_plot = historical.groupby(group_cols)[self.target_col].sum().reset_index()
                            if 'Date' not in hist_plot.columns and all(g in ['Year', 'Month'] for g in group_cols):
                                # Créer une colonne Date à partir de Year et Month
                                hist_plot['Date'] = pd.to_datetime(
                                    hist_plot['Year'].astype(str) + '-' + hist_plot['Month'].astype(str) + '-01'
                                )
                        else:
                            hist_plot = historical
                    else:
                        hist_plot = historical
                    
                    ax.plot(hist_plot['Date'], hist_plot[self.target_col], 
                          marker='x', linestyle='-', color='blue', label='Historique')
                    
                    # Ajouter une ligne verticale pour séparer historique et prédictions
                    last_hist_date = hist_plot['Date'].max()
                    ax.axvline(x=last_hist_date, color='gray', linestyle='--', alpha=0.7)
                    ax.text(last_hist_date, ax.get_ylim()[0], ' Historique | Prédictions ', 
                          ha='center', va='bottom', rotation=90, alpha=0.7)
            else:
                # Cas sans dates (utiliser l'index)
                ax.plot(predictions.index, predictions[self.target_col], 
                      marker='o', linestyle='-', color='red', label='Prédictions')
            
            # Mettre en forme le graphique
            ax.set_title(f'Prédictions futures de {self.target_col}', fontsize=16)
            if 'Date' in predictions.columns:
                ax.set_xlabel('Date', fontsize=12)
            else:
                ax.set_xlabel('Période', fontsize=12)
            ax.set_ylabel(self.target_col, fontsize=12)
            ax.grid(True, linestyle='--', alpha=0.7)
            ax.legend()
            
            # Rotation des dates sur l'axe X pour meilleure lisibilité
            plt.xticks(rotation=45)
            
            # Ajuster le layout
            plt.tight_layout()
            
            # Sauvegarder et retourner le chemin
            filepath = os.path.join(output_dir, "future_predictions.png")
            plt.savefig(filepath, bbox_inches='tight', dpi=300)
            plt.close(fig)
            
            logger.info(f"Graphique des prédictions futures sauvegardé: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Erreur lors de la création du graphique des prédictions: {e}")
            return None


# Exemple d'utilisation
if __name__ == "__main__":
    # Supposons que les données sont déjà chargées et nettoyées
    from data_loader import DataLoader
    
    loader = DataLoader("data/raw/sales_data.csv")
    df = loader.load_data()
    
    if df is not None:
        df_clean = loader.clean_data()
        if df_clean is not None:
            # Prédictions par jour de la semaine
            predictor = SalesPredictor(df_clean)
            
            # Préparation pour prédiction mensuelle
            X, y = predictor.prepare_features(target_col='TotalSales', group_by=['Year', 'Month'])
            
            if X is not None and y is not None:
                # Entraînement des modèles avec validation temporelle
                results = predictor.build_and_train_models(X, y, time_series=True)
                
                if results is not None:
                    # Visualiser la comparaison des modèles
                    predictor.plot_model_comparison(results)
                    
                    # Générer des prédictions pour les 12 prochains mois
                    future_pred = predictor.predict_future(periods=12, freq='M', group_by=['Year', 'Month'])
                    
                    if future_pred is not None:
                        # Visualiser les prédictions
                        # Ajouter l'attribut group_by pour l'agrégation des données historiques
                        df_clean.attrs['group_by'] = ['Year', 'Month']
                        predictor.plot_future_predictions(future_pred, historical=df_clean)
                        
                        print("Prédictions pour les 12 prochains mois:")
                        print(future_pred[['Date', 'TotalSales']])
                        
                        # Sauvegarder les prédictions
                        future_pred.to_csv("output/future_predictions.csv", index=False)
                        print("Prédictions sauvegardées dans 'output/future_predictions.csv'")`}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
          
          <TabsContent value="main" className="mt-0">
            <div className="bg-blue-900/30 rounded-md p-4 mb-4">
              <h4 className="font-semibold mb-2">5. Application principale (main.py)</h4>
              <p className="mb-2">Ce script sert de point d'entrée principal pour l'application, orchestrant l'ensemble du processus d'analyse.</p>
              
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
                {`# main.py
import pandas as pd
import numpy as np
import os
import logging
import argparse
from datetime import datetime
import matplotlib.pyplot as plt

# Importer nos modules
from src.data_loader import DataLoader
from src.data_analyzer import SalesAnalyzer
from src.data_visualizer import SalesVisualizer
from src.sales_predictor import SalesPredictor
from src.report_generator import ReportGenerator

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sales_analyzer.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('main')

def main():
    """
    Fonction principale qui orchestre tout le processus d'analyse.
    """
    # Parser les arguments de ligne de commande
    parser = argparse.ArgumentParser(description='Analyse de données de ventes')
    parser.add_argument('--data', type=str, default='data/raw/sales_data.csv',
                      help='Chemin vers le fichier de données')
    parser.add_argument('--output', type=str, default='output',
                      help='Répertoire de sortie pour les résultats')
    parser.add_argument('--predict', action='store_true',
                      help='Activer la prédiction des ventes futures')
    parser.add_argument('--periods', type=int, default=12,
                      help='Nombre de périodes à prédire')
    parser.add_argument('--freq', type=str, default='M',
                      choices=['D', 'W', 'M'], help='Fréquence des prédictions (D=jour, W=semaine, M=mois)')
    parser.add_argument('--group_by', type=str, nargs='+',
                      help='Colonnes pour grouper les données (pour prédiction)')
    
    args = parser.parse_args()
    
    # Créer les répertoires de sortie
    os.makedirs(args.output, exist_ok=True)
    os.makedirs(os.path.join(args.output, 'figures'), exist_ok=True)
    os.makedirs(os.path.join(args.output, 'models'), exist_ok=True)
    os.makedirs(os.path.join(args.output, 'reports'), exist_ok=True)
    os.makedirs(os.path.join(args.output, 'data'), exist_ok=True)
    
    # 1. Chargement et nettoyage des données
    logger.info("1. Chargement et nettoyage des données")
    data_loader = DataLoader(args.data)
    df = data_loader.load_data()
    
    if df is None:
        logger.error("Impossible de charger les données. Arrêt du programme.")
        return
    
    df_clean = data_loader.clean_data()
    
    if df_clean is None:
        logger.error("Erreur lors du nettoyage des données. Arrêt du programme.")
        return
    
    # Sauvegarder les données nettoyées
    cleaned_data_path = os.path.join(args.output, 'data/sales_clean.csv')
    data_loader.save_processed_data(cleaned_data_path)
    
    # 2. Analyse des données
    logger.info("2. Analyse des données")
    analyzer = SalesAnalyzer(df_clean)
    
    # Statistiques descriptives
    stats = analyzer.get_summary_statistics()
    
    # Corrélations
    correlations = analyzer.analyze_correlations()
    
    # Analyse des séries temporelles
    time_series = analyzer.analyze_time_series()
    
    # Segmentation des clients (si CustomerID existe dans le dataset)
    if 'CustomerID' in df_clean.columns:
        segments = analyzer.segment_customers()
    else:
        segments = None
    
    # Recherche d'insights
    insights = analyzer.find_key_insights()
    
    # 3. Visualisation des données
    logger.info("3. Création des visualisations")
    visualizer = SalesVisualizer(df_clean, output_dir=os.path.join(args.output, 'figures'))
    figures = visualizer.create_all_visualizations()
    
    # 4. Prédiction (si activée)
    future_pred = None
    prediction_results = None
    
    if args.predict:
        logger.info("4. Prédiction des ventes futures")
        predictor = SalesPredictor(df_clean, output_dir=os.path.join(args.output, 'models'))
        
        # Déterminer le groupe_by approprié pour l'agrégation
        group_by = args.group_by
        if group_by is None and args.freq == 'M':
            # Par défaut, grouper par mois et année pour les prédictions mensuelles
            group_by = ['Year', 'Month']
        elif group_by is None and args.freq == 'W':
            # Par défaut, grouper par année et semaine pour les prédictions hebdomadaires
            group_by = ['Year', 'Week']
        
        # Préparation des caractéristiques
        X, y = predictor.prepare_features(target_col='TotalSales', group_by=group_by)
        
        if X is not None and y is not None:
            # Entraînement des modèles
            prediction_results = predictor.build_and_train_models(X, y, time_series=True)
            
            if prediction_results is not None:
                # Visualiser la comparaison des modèles
                predictor.plot_model_comparison(
                    prediction_results, 
                    output_dir=os.path.join(args.output, 'figures')
                )
                
                # Visualiser les performances de prédiction pour le test set
                predictor.plot_actual_vs_predicted(
                    prediction_results,
                    output_dir=os.path.join(args.output, 'figures')
                )
                
                # Générer des prédictions futures
                future_pred = predictor.predict_future(
                    periods=args.periods,
                    freq=args.freq,
                    group_by=group_by
                )
                
                if future_pred is not None:
                    # Sauvegarder les prédictions
                    future_pred.to_csv(
                        os.path.join(args.output, 'data/future_predictions.csv'),
                        index=False
                    )
                    
                    # Visualiser les prédictions
                    df_clean.attrs['group_by'] = group_by
                    predictor.plot_future_predictions(
                        future_pred,
                        historical=df_clean,
                        output_dir=os.path.join(args.output, 'figures')
                    )
                    
                    logger.info(f"Prédictions pour {args.periods} périodes générées")
    
    # 5. Génération de rapport
    logger.info("5. Génération du rapport final")
    report_generator = ReportGenerator(
        df_clean,
        stats=stats,
        correlations=correlations,
        time_series=time_series,
        segments=segments,
        insights=insights,
        figures=figures,
        prediction_results=prediction_results,
        future_predictions=future_pred,
        output_dir=os.path.join(args.output, 'reports')
    )
    
    # Générer un rapport HTML
    html_report = report_generator.generate_html_report()
    
    # Générer un rapport PDF
    pdf_report = report_generator.generate_pdf_report()
    
    # Afficher un résumé des opérations
    logger.info("\nRésumé des opérations:")
    logger.info(f"- Données nettoyées: {cleaned_data_path}")
    logger.info(f"- Visualisations: {len(figures)} graphiques générés")
    
    if args.predict and future_pred is not None:
        logger.info(f"- Prédictions: {args.periods} périodes futures générées")
    
    logger.info(f"- Rapports: {html_report}")
    if pdf_report:
        logger.info(f"             {pdf_report}")
    
    logger.info("\nAnalyse terminée avec succès!")


if __name__ == "__main__":
    main()`}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
        </Tabs>
        
        <Alert className="mb-6">
          <AlertTitle className="flex items-center">
            <FileSearch className="h-5 w-5 mr-2" />
            Note sur le rapport final
          </AlertTitle>
          <AlertDescription>
            Le module <code>report_generator.py</code> mentionné dans le code principal serait responsable de la création de rapports au format HTML et PDF. Ce module utiliserait des bibliothèques comme Jinja2 pour les templates HTML et ReportLab ou WeasyPrint pour la génération de PDF. Nous ne l'avons pas inclus dans le code ci-dessus pour garder l'exemple concis.
          </AlertDescription>
        </Alert>
        
        <h3 className="text-xl font-semibold mb-3">Pour aller plus loin</h3>
        <p className="mb-4">Ce projet d'analyse de données peut être étendu et amélioré de plusieurs façons :</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
            <h4 className="font-semibold mb-2">Améliorations techniques</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Interface utilisateur graphique (GUI) avec Streamlit ou Dash</li>
              <li>API REST avec Flask ou FastAPI pour l'intégration avec d'autres systèmes</li>
              <li>Base de données pour stocker et interroger les données (SQLite, PostgreSQL)</li>
              <li>Automatisation du pipeline avec Airflow ou Luigi</li>
              <li>Conteneurisation avec Docker pour le déploiement facile</li>
              <li>Tests unitaires et d'intégration plus complets</li>
            </ul>
          </div>
          
          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800">
            <h4 className="font-semibold mb-2">Améliorations analytiques</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-200">
              <li>Modèles de prédiction plus avancés (XGBoost, réseaux de neurones)</li>
              <li>Analyse de sentiment des retours clients (NLP)</li>
              <li>Détection d'anomalies plus sophistiquée</li>
              <li>Analyse de panier (association rules mining)</li>
              <li>Recommandations personnalisées par client</li>
              <li>Analyse géospatiale des ventes</li>
            </ul>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Conclusion</h3>
        <p className="mb-3">Dans ce projet final, nous avons appliqué tous les concepts Python et data science que nous avons appris, notamment :</p>
        
        <ul className="list-disc list-inside space-y-1 text-blue-200 mb-6">
          <li>Manipulation de fichiers pour charger et sauvegarder des données</li>
          <li>Structures de données (listes, dictionnaires, etc.) pour organiser l'information</li>
          <li>Fonctions et modules pour structurer le code</li>
          <li>Bibliothèques de data science (pandas, NumPy, matplotlib, scikit-learn)</li>
          <li>Gestion des erreurs pour rendre l'application robuste</li>
          <li>Bonnes pratiques de programmation (documentation, tests, etc.)</li>
        </ul>
        
        <p className="mb-3">Ce projet constitue une base solide que vous pouvez adapter et étendre pour vos propres analyses de données, en fonction de vos besoins spécifiques.</p>
        
        <div className="bg-gradient-to-r from-indigo-700/30 to-purple-700/30 border border-indigo-700/60 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <Sparkles className="h-6 w-6 text-indigo-400 mr-2" />
            Félicitations !
          </h3>
          <p className="mb-3">Vous avez terminé le cours complet sur les fondamentaux de Python pour la data science ! Vous avez maintenant les compétences nécessaires pour :</p>
          
          <ul className="list-disc list-inside space-y-1 text-indigo-200 mb-3">
            <li>Écrire des programmes Python de qualité professionnelle</li>
            <li>Manipuler et analyser des données avec pandas et NumPy</li>
            <li>Créer des visualisations informatives avec matplotlib et seaborn</li>
            <li>Développer des modèles prédictifs avec scikit-learn</li>
            <li>Appliquer les bonnes pratiques de développement en data science</li>
          </ul>
          
          <p>Nous vous encourageons à continuer à pratiquer et à explorer d'autres modules de notre académie DATA & IA pour approfondir vos connaissances et compétences.</p>
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
          variant="outline" 
          disabled
        >
          Suivant
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProjetFinal;