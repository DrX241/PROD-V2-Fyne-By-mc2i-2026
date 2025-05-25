import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart2, Table, PieChart, TrendingUp, Download, FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

// Importer quelques données factices pour les exemples
const sampleDatasets = [
  { 
    id: 'sales', 
    name: 'Ventes par région', 
    description: 'Données de ventes trimestrielles par région et catégorie de produit',
    columns: ['Date', 'Région', 'Catégorie', 'Produit', 'Quantité', 'Prix unitaire', 'Total'],
    preview: [
      ['2025-01-15', 'Europe', 'Électronique', 'Smartphone X', 120, 899, 107880],
      ['2025-01-20', 'Amérique', 'Électronique', 'Laptop Pro', 85, 1299, 110415],
      ['2025-01-25', 'Asie', 'Électronique', 'Écouteurs sans fil', 250, 199, 49750],
      ['2025-02-05', 'Europe', 'Maison', 'Machine à café', 65, 399, 25935],
      ['2025-02-10', 'Amérique', 'Maison', 'Aspirateur robot', 110, 499, 54890],
    ],
    insights: [
      "Les ventes d'électronique représentent 71% du chiffre d'affaires total",
      "L'Europe est le marché le plus rentable avec un panier moyen de 950€",
      "La croissance des ventes en Asie est de +18% par rapport au trimestre précédent"
    ],
    visualizations: [
      { type: 'bar', title: 'Ventes par région', dataKey: 'region' },
      { type: 'pie', title: 'Répartition par catégorie', dataKey: 'category' },
      { type: 'line', title: 'Évolution des ventes', dataKey: 'time' }
    ],
    queries: [
      { 
        name: "Top 5 produits par chiffre d'affaires",
        sql: "SELECT Produit, SUM(Total) as ChiffreAffaires\nFROM ventes\nGROUP BY Produit\nORDER BY ChiffreAffaires DESC\nLIMIT 5;"
      },
      { 
        name: "Comparaison des ventes par région",
        sql: "SELECT Région, SUM(Total) as ChiffreAffaires\nFROM ventes\nGROUP BY Région\nORDER BY ChiffreAffaires DESC;"
      }
    ]
  },
  { 
    id: 'customers', 
    name: 'Analyse clients', 
    description: 'Données démographiques et comportementales des clients',
    columns: ['ID', 'Âge', 'Genre', 'Ville', 'Pays', 'Premier achat', 'Dernier achat', 'Nombre achats', 'Valeur totale'],
    preview: [
      [1001, 34, 'F', 'Paris', 'France', '2024-01-10', '2025-02-28', 8, 1240],
      [1002, 45, 'M', 'Berlin', 'Allemagne', '2023-11-05', '2025-03-15', 12, 3450],
      [1003, 28, 'F', 'Madrid', 'Espagne', '2024-06-22', '2025-02-10', 5, 890],
      [1004, 52, 'M', 'Rome', 'Italie', '2023-08-17', '2025-01-30', 3, 520],
      [1005, 39, 'F', 'Londres', 'UK', '2024-03-08', '2025-03-01', 14, 4200],
    ],
    insights: [
      "Les clients entre 35 et 45 ans génèrent 43% du chiffre d'affaires",
      "La fréquence d'achat moyenne est de 4,8 achats par an",
      "Le taux de fidélisation des clients premium est de 78%"
    ],
    visualizations: [
      { type: 'pie', title: 'Répartition par âge', dataKey: 'age' },
      { type: 'bar', title: 'Valeur client par pays', dataKey: 'country' },
      { type: 'scatter', title: 'Relation âge/valeur', dataKey: 'age_value' }
    ],
    queries: [
      { 
        name: "Segmentation par valeur client",
        sql: "SELECT \n  CASE\n    WHEN Valeur_totale > 3000 THEN 'Premium'\n    WHEN Valeur_totale > 1000 THEN 'Standard'\n    ELSE 'Basic'\n  END as Segment,\n  COUNT(*) as Nombre_Clients,\n  AVG(Nombre_achats) as Achats_Moyens\nFROM clients\nGROUP BY Segment\nORDER BY Nombre_Clients DESC;"
      },
      { 
        name: "Analyse de récence",
        sql: "SELECT\n  DATEDIFF(CURRENT_DATE, Dernier_achat) as Jours_Depuis_Dernier_Achat,\n  COUNT(*) as Nombre_Clients\nFROM clients\nGROUP BY Jours_Depuis_Dernier_Achat\nORDER BY Jours_Depuis_Dernier_Achat;"
      }
    ]
  },
  { 
    id: 'marketing', 
    name: 'Performance marketing', 
    description: 'Données de campagnes marketing et performance des canaux',
    columns: ['Campagne', 'Canal', 'Date_début', 'Date_fin', 'Budget', 'Impressions', 'Clics', 'Conversions', 'Revenu'],
    preview: [
      ['Soldes été', 'Email', '2025-06-01', '2025-06-15', 5000, 150000, 12500, 750, 35000],
      ['Soldes été', 'Facebook', '2025-06-01', '2025-06-15', 8000, 450000, 22000, 1100, 52000],
      ['Soldes été', 'Google Ads', '2025-06-01', '2025-06-15', 12000, 600000, 30000, 1500, 72000],
      ['Rentrée', 'Instagram', '2025-08-15', '2025-09-05', 7000, 380000, 19000, 950, 45000],
      ['Black Friday', 'Tous canaux', '2025-11-20', '2025-11-28', 25000, 1800000, 95000, 4800, 230000],
    ],
    insights: [
      "Le ROI moyen des campagnes marketing est de 385%",
      "Les canaux payants génèrent 65% des conversions totales",
      "Le coût d'acquisition client a diminué de 12% par rapport à l'année précédente"
    ],
    visualizations: [
      { type: 'bar', title: 'Conversions par canal', dataKey: 'channel' },
      { type: 'line', title: 'Évolution ROI', dataKey: 'time' },
      { type: 'pie', title: 'Répartition budget', dataKey: 'budget' }
    ],
    queries: [
      { 
        name: "Analyse ROI par canal",
        sql: "SELECT\n  Canal,\n  SUM(Budget) as Budget_Total,\n  SUM(Revenu) as Revenu_Total,\n  (SUM(Revenu) - SUM(Budget)) / SUM(Budget) * 100 as ROI_Pourcentage\nFROM marketing\nGROUP BY Canal\nORDER BY ROI_Pourcentage DESC;"
      },
      { 
        name: "Taux de conversion par campagne",
        sql: "SELECT\n  Campagne,\n  SUM(Impressions) as Impressions_Totales,\n  SUM(Clics) as Clics_Totaux,\n  SUM(Conversions) as Conversions_Totales,\n  SUM(Clics) / SUM(Impressions) * 100 as CTR,\n  SUM(Conversions) / SUM(Clics) * 100 as Taux_Conversion\nFROM marketing\nGROUP BY Campagne\nORDER BY Taux_Conversion DESC;"
      }
    ]
  }
];

// Composant pour afficher un tableau de données
const DataTable = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800">
            {columns.map((col, i) => (
              <th key={i} className="p-2 text-left text-white border border-slate-700">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/30"}>
              {row.map((cell, j) => (
                <td key={j} className="p-2 border border-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Composant qui simule une visualisation de données
const DataVisualization = ({ type, title }) => {
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col items-center justify-center min-h-[250px]">
      <div className="mb-3 text-lg font-medium">{title}</div>
      {type === 'bar' && (
        <div className="flex items-end justify-center space-x-2 h-32 w-full">
          <div className="bg-blue-500 w-8 h-[40%] rounded-t"></div>
          <div className="bg-blue-500 w-8 h-[70%] rounded-t"></div>
          <div className="bg-blue-500 w-8 h-[90%] rounded-t"></div>
          <div className="bg-blue-500 w-8 h-[60%] rounded-t"></div>
          <div className="bg-blue-500 w-8 h-[30%] rounded-t"></div>
        </div>
      )}
      {type === 'pie' && (
        <div className="relative h-32 w-32">
          <div className="absolute inset-0 bg-blue-500 rounded-full"></div>
          <div className="absolute inset-0 bg-green-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }}></div>
          <div className="absolute inset-0 bg-purple-500 rounded-full" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%)' }}></div>
          <div className="absolute inset-0 border-2 border-slate-800 rounded-full"></div>
        </div>
      )}
      {type === 'line' && (
        <div className="flex items-end justify-center space-x-2 h-32 w-full relative">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-slate-600"></div>
          <div className="absolute inset-y-0 left-0 w-[1px] bg-slate-600"></div>
          <svg viewBox="0 0 100 50" className="h-32 w-full overflow-visible">
            <polyline
              points="0,45 20,30 40,35 60,15 80,20 100,5"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
      {type === 'scatter' && (
        <div className="flex items-center justify-center h-32 w-full relative">
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-slate-600"></div>
          <div className="absolute inset-y-0 left-0 w-[1px] bg-slate-600"></div>
          <div className="absolute h-2 w-2 bg-blue-500 rounded-full" style={{ bottom: '20%', left: '30%' }}></div>
          <div className="absolute h-2 w-2 bg-blue-500 rounded-full" style={{ bottom: '50%', left: '45%' }}></div>
          <div className="absolute h-2 w-2 bg-blue-500 rounded-full" style={{ bottom: '70%', left: '60%' }}></div>
          <div className="absolute h-2 w-2 bg-blue-500 rounded-full" style={{ bottom: '30%', left: '75%' }}></div>
          <div className="absolute h-2 w-2 bg-blue-500 rounded-full" style={{ bottom: '60%', left: '25%' }}></div>
        </div>
      )}
    </div>
  );
};

// Composant principal
export default function DataAnalyst() {
  const [, setLocation] = useLocation();
  const [selectedDataset, setSelectedDataset] = useState(sampleDatasets[0]);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      <Helmet>
        <title>Data Analyst | Explorer les données</title>
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setLocation('/data-ia/roleplay')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            Laboratoire d'analyse de données
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card className="col-span-1 bg-slate-800/50 border-slate-700 h-full">
            <CardHeader>
              <CardTitle className="flex items-center text-green-300">
                <BarChart2 className="h-5 w-5 mr-2" />
                Jeux de données
              </CardTitle>
              <CardDescription>
                Sélectionnez un dataset pour l'analyser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleDatasets.map(dataset => (
                  <div 
                    key={dataset.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedDataset.id === dataset.id 
                        ? 'bg-green-900/30 border border-green-600/50' 
                        : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                    }`}
                    onClick={() => setSelectedDataset(dataset)}
                  >
                    <div className="font-medium text-green-200">{dataset.name}</div>
                    <div className="text-sm text-slate-300 mt-1">{dataset.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-3 bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-300">
                {selectedDataset.name}
              </CardTitle>
              <CardDescription>
                {selectedDataset.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-transparent border-b-0 p-0 justify-start mb-4">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-green-800/40 rounded-md px-4"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Aperçu des données
                  </TabsTrigger>
                  <TabsTrigger 
                    value="visualizations" 
                    className="data-[state=active]:bg-green-800/40 rounded-md px-4"
                  >
                    <PieChart className="h-4 w-4 mr-2" />
                    Visualisations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="data-[state=active]:bg-green-800/40 rounded-md px-4"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Insights
                  </TabsTrigger>
                  <TabsTrigger 
                    value="queries" 
                    className="data-[state=active]:bg-green-800/40 rounded-md px-4"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Requêtes SQL
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="m-0">
                  <div className="rounded-md overflow-hidden border border-slate-700">
                    <DataTable 
                      columns={selectedDataset.columns} 
                      data={selectedDataset.preview}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button className="bg-green-700 hover:bg-green-800">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger les données
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="visualizations" className="m-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {selectedDataset.visualizations.map((viz, i) => (
                      <DataVisualization 
                        key={i} 
                        type={viz.type} 
                        title={viz.title} 
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="m-0">
                  <Card className="bg-green-900/20 border-green-600/30">
                    <CardHeader>
                      <CardTitle className="text-green-300 text-lg">
                        Insights clés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {selectedDataset.insights.map((insight, i) => (
                          <li key={i} className="flex items-start">
                            <div className="h-5 w-5 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-300 flex-shrink-0 mt-0.5 mr-3">
                              {i+1}
                            </div>
                            <p>{insight}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-6 bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-lg font-medium text-green-300 mb-3">
                      Analyse IA
                    </h3>
                    <p className="text-slate-300 mb-4">
                      Notre modèle d'intelligence artificielle a analysé ces données et suggère les actions suivantes:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                        Segmenter les clients par fréquence d'achat et valeur pour identifier les opportunités de cross-selling
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                        Réaliser une analyse de saisonnalité pour optimiser les stocks et les promotions
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                        Construire un modèle prédictif pour anticiper les tendances des prochains trimestres
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="queries" className="m-0">
                  <div className="space-y-6">
                    {selectedDataset.queries.map((query, i) => (
                      <div key={i} className="bg-slate-800/80 rounded-lg overflow-hidden border border-slate-700">
                        <div className="bg-slate-700/50 px-4 py-2 flex justify-between items-center">
                          <h3 className="font-medium text-green-300">{query.name}</h3>
                          <Button size="sm" variant="ghost" className="h-8 text-xs">
                            Exécuter
                          </Button>
                        </div>
                        <div className="p-4">
                          <pre className="text-sm bg-slate-900/70 p-3 rounded font-mono text-slate-300 overflow-x-auto">
                            {query.sql}
                          </pre>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-green-300 mb-3">
                        Écrire une requête personnalisée
                      </h3>
                      <div className="bg-slate-900/70 p-3 rounded font-mono border border-slate-700 min-h-[150px]">
                        <textarea 
                          className="w-full bg-transparent outline-none min-h-[120px] text-slate-300 resize-none" 
                          placeholder="SELECT * FROM dataset WHERE..."
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button className="bg-green-700 hover:bg-green-800">
                          Exécuter la requête
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-green-300">
              Projets d'analyse récents
            </CardTitle>
            <CardDescription>
              Consultez vos analyses précédentes et poursuivez votre travail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-md border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                <h3 className="font-medium text-green-200">Analyse de cohortes clients</h3>
                <p className="text-sm text-slate-300 mt-1">Dernière modification: 18 mai 2025</p>
                <div className="mt-3 text-xs text-slate-400">12 visualisations • 8 requêtes SQL</div>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-md border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                <h3 className="font-medium text-green-200">Prévisions ventes Q3 2025</h3>
                <p className="text-sm text-slate-300 mt-1">Dernière modification: 10 mai 2025</p>
                <div className="mt-3 text-xs text-slate-400">6 visualisations • 10 requêtes SQL</div>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-md border border-slate-600 hover:bg-slate-700/50 cursor-pointer transition-colors">
                <h3 className="font-medium text-green-200">Dashboard KPIs marketing</h3>
                <p className="text-sm text-slate-300 mt-1">Dernière modification: 5 mai 2025</p>
                <div className="mt-3 text-xs text-slate-400">15 visualisations • 5 requêtes SQL</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}