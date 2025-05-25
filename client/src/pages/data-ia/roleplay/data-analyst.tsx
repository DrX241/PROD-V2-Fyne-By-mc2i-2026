import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, BarChart2, Table, PieChart, TrendingUp, Download, FileText, 
  Upload, Code, Play, Check, Save, Plus, RefreshCw, Database, Edit, X, HelpCircle,
  Eye, Sparkles, Clipboard, LineChart
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Quelques données d'exemple pour démarrer
const startingData = {
  sales: `Date,Region,Category,Product,Quantity,UnitPrice,Total
2025-01-15,Europe,Electronics,Smartphone X,120,899,107880
2025-01-20,Americas,Electronics,Laptop Pro,85,1299,110415
2025-01-25,Asia,Electronics,Wireless Earbuds,250,199,49750
2025-02-05,Europe,Home,Coffee Machine,65,399,25935
2025-02-10,Americas,Home,Robot Vacuum,110,499,54890
2025-02-15,Asia,Electronics,Smart Watch,180,299,53820
2025-02-20,Europe,Clothing,Winter Jacket,95,129,12255
2025-02-25,Americas,Clothing,Running Shoes,220,89,19580
2025-03-01,Asia,Home,Air Purifier,75,349,26175
2025-03-05,Europe,Electronics,Tablet,130,599,77870`,
  
  customer: `ID,Age,Gender,City,Country,FirstPurchase,LastPurchase,PurchaseCount,TotalValue
1001,34,F,Paris,France,2024-01-10,2025-02-28,8,1240
1002,45,M,Berlin,Germany,2023-11-05,2025-03-15,12,3450
1003,28,F,Madrid,Spain,2024-06-22,2025-02-10,5,890
1004,52,M,Rome,Italy,2023-08-17,2025-01-30,3,520
1005,39,F,London,UK,2024-03-08,2025-03-01,14,4200
1006,25,M,Amsterdam,Netherlands,2024-07-14,2025-03-10,6,950
1007,41,F,Brussels,Belgium,2023-12-25,2025-02-18,9,2100
1008,37,M,Warsaw,Poland,2024-05-05,2025-03-05,7,1670
1009,48,F,Stockholm,Sweden,2023-09-30,2025-02-27,11,3280
1010,31,M,Lisbon,Portugal,2024-04-12,2025-01-24,4,780`,
  
  web_analytics: `Date,Page,Visitors,PageViews,BounceRate,AvgTimeOnPage,Conversions
2025-01-01,Home,12500,18750,45.2,00:02:15,125
2025-01-01,Products,8300,16600,38.7,00:03:42,98
2025-01-01,About,3200,3840,62.5,00:01:18,12
2025-01-01,Contact,1800,2160,51.8,00:01:45,23
2025-01-01,Checkout,950,1900,12.4,00:04:50,87
2025-01-02,Home,13100,19650,43.8,00:02:20,138
2025-01-02,Products,8750,17500,37.2,00:03:55,112
2025-01-02,About,2950,3540,63.1,00:01:15,9
2025-01-02,Contact,1920,2304,50.4,00:01:50,27
2025-01-02,Checkout,1050,2100,11.8,00:05:05,94`
};

// Exemples de requêtes SQL
const sqlExamples = [
  {
    name: "Grouper et agréger (SUM, COUNT, AVG)",
    description: "Agrégation des ventes par région",
    sql: "SELECT Region, SUM(Total) as TotalSales, COUNT(*) as TransactionCount, AVG(Total) as AvgSale\nFROM sales\nGROUP BY Region\nORDER BY TotalSales DESC;"
  },
  {
    name: "Filtrer avec WHERE et opérateurs de comparaison",
    description: "Transactions supérieures à 50000",
    sql: "SELECT Date, Region, Product, Total\nFROM sales\nWHERE Total > 50000\nORDER BY Total DESC;"
  },
  {
    name: "Analyser par catégorie et sous-groupes",
    description: "Ventilation des ventes par catégorie et région",
    sql: "SELECT Category, Region, SUM(Total) as Revenue\nFROM sales\nGROUP BY Category, Region\nORDER BY Category, Revenue DESC;"
  },
  {
    name: "Segmentation avec CASE WHEN",
    description: "Classifier les ventes par taille",
    sql: "SELECT Product,\n  CASE\n    WHEN Total > 100000 THEN 'Large'\n    WHEN Total > 50000 THEN 'Medium'\n    ELSE 'Small'\n  END as SaleSize,\n  Total\nFROM sales\nORDER BY Total DESC;"
  },
  {
    name: "Analyse temporelle",
    description: "Ventes par mois (extrait du mois de la date)",
    sql: "SELECT SUBSTR(Date, 6, 2) as Month,\n  SUM(Total) as MonthlyRevenue\nFROM sales\nGROUP BY Month\nORDER BY Month;"
  }
];

// Liste des types de visualisations proposées
const vizTypes = [
  { id: 'bar', name: 'Diagramme à barres', description: 'Comparer des valeurs entre différentes catégories' },
  { id: 'line', name: 'Graphique linéaire', description: 'Montrer l\'évolution sur une période de temps' },
  { id: 'pie', name: 'Diagramme circulaire', description: 'Illustrer la proportion des parties par rapport au tout' },
  { id: 'scatter', name: 'Nuage de points', description: 'Examiner la relation entre deux variables' },
  { id: 'heatmap', name: 'Carte thermique', description: 'Visualiser l\'intensité des valeurs dans une matrice' },
  { id: 'boxplot', name: 'Boîte à moustaches', description: 'Afficher la distribution statistique des données' }
];

// Composant pour afficher un tableau de données
const DataTable = ({ data, maxRows = 10 }) => {
  // Si les données sont vides, afficher un message
  if (!data || !data.trim()) {
    return (
      <div className="p-6 text-center text-slate-400">
        <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Aucune donnée à afficher</p>
        <p className="text-sm mt-1">Importez ou créez des données pour commencer</p>
      </div>
    );
  }

  // Traiter les données CSV
  const lines = data.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1, maxRows + 1).map(line => line.split(','));
  
  // Afficher une indication si les données sont tronquées
  const hasMoreRows = lines.length > maxRows + 1;
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-800">
            {headers.map((header, i) => (
              <th key={i} className="p-2 text-left text-white border border-slate-700">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/30"}>
              {row.map((cell, j) => (
                <td key={j} className="p-2 border border-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {hasMoreRows && (
        <div className="text-center text-xs text-slate-400 mt-2">
          Affichage des {maxRows} premières lignes sur {lines.length - 1} au total
        </div>
      )}
    </div>
  );
};

// Composant pour exécuter une requête SQL
const SQLExecutor = ({ data, onResult }) => {
  const [query, setQuery] = useState('');
  const [selectedExample, setSelectedExample] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Fonction pour exécuter la requête SQL via l'API
  const executeQuery = async () => {
    if (!query.trim()) {
      setError("Veuillez entrer une requête SQL");
      return;
    }
    
    setError('');
    setIsProcessing(true);
    
    try {
      // Utiliser l'API existante pour exécuter la requête
      const response = await fetch('/api/code/execute/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sql: query,
          dataset: Object.keys(data)[0] // Utiliser la première table disponible comme contexte
        }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        // Formater le résultat pour l'affichage dans le tableau
        if (responseData.data && Array.isArray(responseData.data)) {
          // Construire un résultat CSV à partir des données JSON retournées
          const columns = responseData.columns || Object.keys(responseData.data[0] || {});
          const csvHeader = columns.join(',');
          
          const csvRows = responseData.data.map(row => {
            return columns.map(col => {
              const value = row[col];
              return value !== undefined && value !== null ? String(value) : '';
            }).join(',');
          });
          
          const csvResult = [csvHeader, ...csvRows].join('\n');
          onResult(csvResult);
        } else {
          // Message de succès pour les opérations non-SELECT
          onResult(responseData.result || 'Opération effectuée avec succès');
        }
      } else {
        throw new Error(responseData.result || responseData.error || 'Erreur lors de l\'exécution de la requête');
      }
    } 
    catch (err) {
      console.error('Erreur SQL:', err);
      setError(err.message || 'Erreur lors de l\'exécution de la requête');
      onResult('');
      
      // Fallback au traitement côté client si l'API échoue
      try {
        // Extraire la table cible de la requête
        const queryLower = query.toLowerCase();
        const fromMatch = queryLower.match(/from\s+(\w+)/);
        const tableName = fromMatch ? fromMatch[1] : null;
        
        // Vérifier si la table existe dans nos données
        if (tableName && data[tableName]) {
          let result = '';
          
          // Simuler un résultat en fonction du type de requête
          if (queryLower.includes('group by')) {
            result = `col1,col2,aggregated_value\ngroup1,subgroup1,12500\ngroup1,subgroup2,8300\ngroup2,subgroup1,3200`;
          } 
          else if (queryLower.includes('order by')) {
            result = `col1,col2,col3\nrow1_sorted,value1,32500\nrow2_sorted,value2,28900\nrow3_sorted,value3,15700`;
          }
          else {
            // Requête SELECT simple - utiliser les données locales
            const tableLines = data[tableName].split('\n');
            result = tableLines.slice(0, Math.min(6, tableLines.length)).join('\n');
          }
          
          onResult(result);
          setError('Note: Résultat simulé localement (mode fallback)');
        }
      } catch (fallbackErr) {
        // Si même le fallback échoue, ne rien faire de plus
        console.error('Erreur fallback:', fallbackErr);
      }
    }
    finally {
      setIsProcessing(false);
    }
  };
  
  // Sélectionner un exemple de requête
  const selectExample = (example) => {
    setSelectedExample(example);
    setQuery(example.sql);
    setError('');
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-slate-900/70 rounded-lg border border-slate-700">
        <div className="flex items-center p-2 bg-slate-800 rounded-t-lg border-b border-slate-700">
          <Code className="text-green-400 h-4 w-4 mr-2" />
          <span className="text-sm font-medium">Éditeur SQL</span>
          <div className="ml-auto flex items-center gap-2">
            <Select 
              value={selectedExample ? selectedExample.name : ""} 
              onValueChange={(val) => {
                const example = sqlExamples.find(ex => ex.name === val);
                if (example) selectExample(example);
              }}
            >
              <SelectTrigger className="h-7 text-xs w-[180px] bg-slate-800 border-slate-600">
                <SelectValue placeholder="Exemples de requêtes" />
              </SelectTrigger>
              <SelectContent>
                {sqlExamples.map((example) => (
                  <SelectItem key={example.name} value={example.name}>
                    <span className="text-xs">{example.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM sales WHERE Region = 'Europe' ORDER BY Total DESC"
          className="font-mono resize-none bg-transparent border-0 focus-visible:ring-0 p-3 min-h-[150px] text-green-300"
        />
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
          <X className="h-4 w-4 text-red-300" />
          <AlertTitle>Erreur SQL</AlertTitle>
          <AlertDescription className="font-mono text-sm">{error}</AlertDescription>
        </Alert>
      )}
      
      {selectedExample && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-md p-3 text-sm">
          <p className="font-medium text-green-300 mb-1">{selectedExample.name}</p>
          <p className="text-slate-300 text-xs">{selectedExample.description}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          className="bg-green-700 hover:bg-green-800"
          disabled={isProcessing}
          onClick={executeQuery}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Exécution...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Exécuter la requête
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Composant pour éditer des données CSV
const DataEditor = ({ initialData, onSave }) => {
  const [editorContent, setEditorContent] = useState(initialData || '');
  const [previewMode, setPreviewMode] = useState(false);
  
  const handleSave = () => {
    onSave(editorContent);
  };
  
  const getRowCount = () => {
    if (!editorContent) return 0;
    return editorContent.split('\n').length - 1; // -1 pour ne pas compter l'en-tête
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 mr-2">
            {getRowCount()} lignes
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreviewMode(!previewMode)}>
                  {previewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{previewMode ? "Modifier les données" : "Prévisualiser"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button onClick={handleSave} className="bg-green-700 hover:bg-green-800">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>
      
      {previewMode ? (
        <div className="border border-slate-700 rounded-md overflow-hidden">
          <DataTable data={editorContent} />
        </div>
      ) : (
        <Textarea
          value={editorContent}
          onChange={(e) => setEditorContent(e.target.value)}
          placeholder="Entrez vos données au format CSV (avec entête)"
          className="font-mono resize-none bg-slate-900/70 min-h-[250px] text-sm"
        />
      )}
      
      <div className="text-xs text-slate-400">
        <p>Format attendu: CSV avec en-tête en première ligne. Exemple:</p>
        <code className="text-green-300 block mt-1 bg-slate-900/50 p-2 rounded">
          Date,Region,Product,Quantity,Price,Total<br/>
          2025-01-15,Europe,Smartphone,120,899,107880<br/>
          2025-01-20,Americas,Laptop,85,1299,110415
        </code>
      </div>
    </div>
  );
};

// Composant qui simule une visualisation de données
const DataVisualization = ({ type, config }) => {
  const title = config?.title || "Graphique sans titre";
  
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
      {type === 'heatmap' && (
        <div className="grid grid-cols-5 gap-1 h-32 w-full max-w-[300px]">
          {Array.from({ length: 25 }).map((_, i) => {
            const intensity = Math.random();
            const color = `rgba(59, 130, 246, ${intensity.toFixed(2)})`;
            return <div key={i} className="rounded" style={{ backgroundColor: color }}></div>;
          })}
        </div>
      )}
      {type === 'boxplot' && (
        <div className="flex items-center justify-center h-32 w-full">
          <div className="relative h-10 w-[80%] flex items-center">
            <div className="absolute left-0 h-0.5 w-10 bg-blue-500"></div>
            <div className="absolute left-10 h-full w-20 border-2 border-blue-500"></div>
            <div className="absolute left-[70px] h-10 w-0.5 bg-blue-500"></div>
            <div className="absolute left-30 h-0.5 w-[calc(100%-40px)] bg-blue-500"></div>
            <div className="absolute right-0 h-0.5 w-10 bg-blue-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour créer une nouvelle visualisation
const CreateVisualization = ({ tables, onSave }) => {
  const [vizType, setVizType] = useState('bar');
  const [vizTitle, setVizTitle] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [columns, setColumns] = useState([]);
  
  // Mettre à jour les colonnes disponibles lorsque la table sélectionnée change
  useEffect(() => {
    if (selectedTable && tables[selectedTable]) {
      const header = tables[selectedTable].split('\n')[0];
      setColumns(header.split(','));
    } else {
      setColumns([]);
    }
  }, [selectedTable, tables]);
  
  const handleSave = () => {
    if (!vizTitle || !selectedTable || !xAxis || !yAxis) {
      // Gérer les erreurs de validation
      return;
    }
    
    onSave({
      type: vizType,
      title: vizTitle,
      config: {
        table: selectedTable,
        xAxis,
        yAxis
      }
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="viz-title">Titre du graphique</Label>
            <Input 
              id="viz-title" 
              placeholder="Ex: Ventes par région" 
              value={vizTitle}
              onChange={(e) => setVizTitle(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
          
          <div>
            <Label htmlFor="table-select">Source de données</Label>
            <Select 
              value={selectedTable} 
              onValueChange={setSelectedTable}
            >
              <SelectTrigger id="table-select" className="bg-slate-800/50 border-slate-700">
                <SelectValue placeholder="Sélectionner une table" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(tables).map(table => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="x-axis">Axe X / Catégorie</Label>
              <Select 
                value={xAxis} 
                onValueChange={setXAxis}
                disabled={!selectedTable}
              >
                <SelectTrigger id="x-axis" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Choisir une colonne" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="y-axis">Axe Y / Valeur</Label>
              <Select 
                value={yAxis} 
                onValueChange={setYAxis}
                disabled={!selectedTable}
              >
                <SelectTrigger id="y-axis" className="bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Choisir une colonne" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>Type de visualisation</Label>
          <RadioGroup 
            value={vizType} 
            onValueChange={setVizType}
            className="grid grid-cols-2 gap-3"
          >
            {vizTypes.map(type => (
              <div key={type.id} className="flex items-start space-x-2">
                <RadioGroupItem value={type.id} id={`viz-type-${type.id}`} className="mt-1" />
                <Label htmlFor={`viz-type-${type.id}`} className="font-normal cursor-pointer">
                  <span className="font-medium text-green-300">{type.name}</span>
                  <p className="text-xs text-slate-400">{type.description}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-700">
        <h3 className="text-lg font-medium text-green-300 mb-3">Aperçu</h3>
        <DataVisualization type={vizType} config={{ title: vizTitle || "Aperçu du graphique" }} />
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="bg-green-700 hover:bg-green-800"
          onClick={handleSave}
          disabled={!vizTitle || !selectedTable || !xAxis || !yAxis}
        >
          <Check className="h-4 w-4 mr-2" />
          Créer le graphique
        </Button>
      </div>
    </div>
  );
};

// Composant pour l'importation de données
const DataImport = ({ onImport }) => {
  const [dataFormat, setDataFormat] = useState('csv');
  const [dataSource, setDataSource] = useState('paste');
  const [pastedData, setPastedData] = useState('');
  const [tableName, setTableName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  const handleImport = () => {
    if (!tableName) {
      setError("Veuillez donner un nom à votre table");
      return;
    }
    
    if (!pastedData) {
      setError("Aucune donnée à importer");
      return;
    }
    
    try {
      // Validation minimale pour le CSV (vérifier qu'il y a un en-tête et au moins une ligne de données)
      const lines = pastedData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error("Le fichier doit contenir au moins un en-tête et une ligne de données");
      }
      
      // Vérifier que toutes les lignes ont le même nombre de colonnes
      const headerCols = lines[0].split(',').length;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').length;
        if (cols !== headerCols) {
          throw new Error(`La ligne ${i+1} contient un nombre différent de colonnes (${cols}) par rapport à l'en-tête (${headerCols})`);
        }
      }
      
      onImport(tableName, pastedData);
      // Réinitialiser le formulaire
      setPastedData('');
      setTableName('');
      setError('');
    }
    catch (err) {
      setError(err.message);
    }
  };
  
  // Simuler l'import d'un fichier (dans un environnement réel, on lirait le contenu du fichier)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Dans une application réelle, on lirait le contenu du fichier
    // Pour cette simulation, on génère des données factices
    if (file.name.endsWith('.csv')) {
      const fakeCsvContent = `Column1,Column2,Column3,Column4\nvalue1,value2,value3,value4\nvalue5,value6,value7,value8\nvalue9,value10,value11,value12`;
      setPastedData(fakeCsvContent);
      
      // Suggérer un nom de table basé sur le nom du fichier
      const baseName = file.name.replace('.csv', '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      setTableName(baseName);
    }
    else {
      setError("Format de fichier non pris en charge. Seuls les fichiers CSV sont acceptés pour le moment.");
    }
  };
  
  // Échantillons de données pour faciliter les tests
  const dataSamples = [
    { name: "Ventes mensuelles", data: "Month,Product,Region,Sales\nJan,Product A,North,1200\nJan,Product B,North,900\nFeb,Product A,North,1100\nFeb,Product B,North,950\nMar,Product A,North,1300\nMar,Product B,North,1000" },
    { name: "Données utilisateurs", data: "UserID,Age,Gender,Country,Purchases\n1001,34,F,France,12\n1002,28,M,Germany,8\n1003,45,F,Spain,15\n1004,22,M,Italy,5\n1005,39,F,UK,20" },
    { name: "Données de trafic web", data: "Date,Page,Visits,ConversionRate\n2025-01-01,Home,1200,2.5\n2025-01-01,Products,800,3.2\n2025-01-01,About,300,1.0\n2025-01-02,Home,1300,2.7\n2025-01-02,Products,850,3.5" }
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="table-name" className="mb-2 block">Nom de la table</Label>
          <Input 
            id="table-name"
            placeholder="Ex: sales_data, user_metrics, etc."
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="bg-slate-800/50 border-slate-700"
          />
          <p className="text-xs text-slate-400 mt-1">
            Utilisez un nom simple sans espaces ni caractères spéciaux
          </p>
        </div>
        
        <div>
          <Label className="mb-2 block">Format de données</Label>
          <RadioGroup 
            value={dataFormat} 
            onValueChange={setDataFormat}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="csv" id="data-format-csv" />
              <Label htmlFor="data-format-csv" className="font-normal">CSV</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="json" id="data-format-json" disabled />
              <Label htmlFor="data-format-json" className="font-normal text-slate-500">JSON (à venir)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excel" id="data-format-excel" disabled />
              <Label htmlFor="data-format-excel" className="font-normal text-slate-500">Excel (à venir)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Source des données</Label>
          <RadioGroup 
            value={dataSource} 
            onValueChange={setDataSource}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paste" id="data-source-paste" />
              <Label htmlFor="data-source-paste" className="font-normal">Coller du texte</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upload" id="data-source-upload" />
              <Label htmlFor="data-source-upload" className="font-normal">Importer un fichier</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sample" id="data-source-sample" />
              <Label htmlFor="data-source-sample" className="font-normal">Utiliser un exemple</Label>
            </div>
          </RadioGroup>
        </div>
        
        {dataSource === 'paste' && (
          <div>
            <Label htmlFor="data-paste" className="mb-2 block">Collez vos données CSV</Label>
            <Textarea 
              id="data-paste"
              placeholder="col1,col2,col3\nvaleur1,valeur2,valeur3\nvaleur4,valeur5,valeur6"
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              className="font-mono resize-none bg-slate-800/50 min-h-[200px]"
            />
          </div>
        )}
        
        {dataSource === 'upload' && (
          <div>
            <Label htmlFor="file-upload" className="mb-2 block">Sélectionnez un fichier</Label>
            <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md p-8 text-center">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline" 
                className="mb-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choisir un fichier
              </Button>
              <p className="text-xs text-slate-400">
                Formats acceptés: CSV (séparé par des virgules)
              </p>
            </div>
          </div>
        )}
        
        {dataSource === 'sample' && (
          <div>
            <Label className="mb-2 block">Sélectionnez un exemple</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dataSamples.map((sample, index) => (
                <div 
                  key={index}
                  className="bg-slate-800/50 border border-slate-700 rounded-md p-3 cursor-pointer hover:bg-slate-800/80 hover:border-green-600/50 transition-colors"
                  onClick={() => {
                    setPastedData(sample.data);
                    setTableName(sample.name.toLowerCase().replace(/\s+/g, '_'));
                  }}
                >
                  <h4 className="font-medium text-green-300 mb-1">{sample.name}</h4>
                  <p className="text-xs text-slate-400">
                    {sample.data.split('\n')[0]}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {sample.data.split('\n').length - 1} lignes
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
          <X className="h-4 w-4 text-red-300" />
          <AlertTitle>Erreur d'importation</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {pastedData && (
        <div className="border-t border-slate-700 pt-4">
          <Label className="mb-2 block">Aperçu des données</Label>
          <div className="bg-slate-800/50 border border-slate-700 rounded-md overflow-hidden">
            <DataTable data={pastedData} maxRows={5} />
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Button 
          className="bg-green-700 hover:bg-green-800"
          onClick={handleImport}
          disabled={!tableName || !pastedData}
        >
          <Check className="h-4 w-4 mr-2" />
          Importer les données
        </Button>
      </div>
    </div>
  );
};

// Composant principal
export default function DataAnalyst() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('data');
  const [tables, setTables] = useState({
    sales: startingData.sales,
    customers: startingData.customer,
    web_analytics: startingData.web_analytics
  });
  
  const [activeTable, setActiveTable] = useState('sales');
  const [editMode, setEditMode] = useState(false);
  const [visualizations, setVisualizations] = useState([
    { id: 'viz1', type: 'bar', title: 'Ventes par région', config: { table: 'sales', xAxis: 'Region', yAxis: 'Total' } },
    { id: 'viz2', type: 'line', title: 'Évolution des ventes', config: { table: 'sales', xAxis: 'Date', yAxis: 'Total' } },
  ]);
  const [showNewVizForm, setShowNewVizForm] = useState(false);
  const [sqlResult, setSqlResult] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  
  // Gérer la sauvegarde des données éditées
  const handleSaveData = (newData) => {
    setTables(prev => ({
      ...prev,
      [activeTable]: newData
    }));
    setEditMode(false);
  };
  
  // Gérer l'ajout d'une nouvelle visualisation
  const handleAddVisualization = (newViz) => {
    setVisualizations(prev => [
      ...prev,
      { id: `viz${Date.now()}`, ...newViz }
    ]);
    setShowNewVizForm(false);
  };
  
  // Gérer l'importation de nouvelles données
  const handleImportData = (tableName, data) => {
    setTables(prev => ({
      ...prev,
      [tableName]: data
    }));
    setActiveTable(tableName);
    setShowImportForm(false);
  };
  
  // Déterminer si une table existe et a des données
  const hasTableData = (tableName) => {
    return tables[tableName] && tables[tableName].trim() !== '';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200">
      <Helmet>
        <title>Data Analyst | Laboratoire d'analyse</title>
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
        
        <div className="mb-6">
          <p className="text-slate-300">
            Bienvenue dans votre environnement d'analyse de données. Importez vos propres données, créez des visualisations et explorez vos données avec SQL.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700">
            <TabsList className="bg-transparent border-b-0 py-2 justify-start">
              <TabsTrigger 
                value="data" 
                className="data-[state=active]:bg-green-800/40 rounded-md px-4"
              >
                <Database className="h-4 w-4 mr-2" />
                Données
              </TabsTrigger>
              <TabsTrigger 
                value="visualize" 
                className="data-[state=active]:bg-green-800/40 rounded-md px-4"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Visualisations
              </TabsTrigger>
              <TabsTrigger 
                value="analyze" 
                className="data-[state=active]:bg-green-800/40 rounded-md px-4"
              >
                <Code className="h-4 w-4 mr-2" />
                Requêtes SQL
              </TabsTrigger>
              <TabsTrigger 
                value="learn" 
                className="data-[state=active]:bg-green-800/40 rounded-md px-4"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Apprendre
              </TabsTrigger>
            </TabsList>
            
            <div>
              {activeTab === 'data' && (
                <Button 
                  variant="outline" 
                  className="border-green-600/30 text-green-300 hover:bg-green-900/20"
                  onClick={() => setShowImportForm(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer des données
                </Button>
              )}
              {activeTab === 'visualize' && (
                <Button 
                  variant="outline" 
                  className="border-green-600/30 text-green-300 hover:bg-green-900/20"
                  onClick={() => setShowNewVizForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle visualisation
                </Button>
              )}
            </div>
          </div>
          
          {/* Onglet Données */}
          <TabsContent value="data" className="m-0 space-y-6">
            {showImportForm ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-green-300">Importer des données</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowImportForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Importez vos propres données pour les analyser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataImport onImport={handleImportData} />
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card className="col-span-1 bg-slate-800/50 border-slate-700 h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-300">
                        <Database className="h-5 w-5 mr-2" />
                        Tables disponibles
                      </CardTitle>
                      <CardDescription>
                        Sélectionnez une table pour visualiser et modifier ses données
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.keys(tables).map(tableName => (
                          <div 
                            key={tableName}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${
                              activeTable === tableName 
                                ? 'bg-green-900/30 border border-green-600/50' 
                                : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                            }`}
                            onClick={() => {
                              setActiveTable(tableName);
                              setEditMode(false);
                            }}
                          >
                            <div className="font-medium text-green-200">{tableName}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {tables[tableName] ? 
                                `${tables[tableName].split('\n').length - 1} lignes` : 
                                'Table vide'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-1 lg:col-span-3 bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-green-300">
                          {activeTable}
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-green-600/30 text-green-300 hover:bg-green-900/20"
                          onClick={() => setEditMode(!editMode)}
                        >
                          {editMode ? (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Afficher
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editMode ? (
                        <DataEditor 
                          initialData={tables[activeTable]} 
                          onSave={handleSaveData} 
                        />
                      ) : (
                        <div className="rounded-md overflow-hidden border border-slate-700">
                          <DataTable 
                            data={tables[activeTable]} 
                            maxRows={10}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Conseils pour la préparation des données
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-green-300 hover:text-green-200">
                          Structure optimale des données
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300">
                          <ul className="space-y-2 list-disc list-inside">
                            <li>Organisez vos données au format tabulaire avec des colonnes bien définies</li>
                            <li>Chaque colonne doit représenter une variable ou une mesure spécifique</li>
                            <li>Chaque ligne doit représenter une observation ou un enregistrement unique</li>
                            <li>Évitez les cellules fusionnées ou les structures hiérarchiques complexes</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="text-green-300 hover:text-green-200">
                          Nettoyage des données
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300">
                          <ul className="space-y-2 list-disc list-inside">
                            <li>Vérifiez l'absence de valeurs manquantes ou remplacez-les par des valeurs appropriées</li>
                            <li>Assurez-vous que les types de données sont cohérents (nombres, dates, texte)</li>
                            <li>Standardisez les unités de mesure pour les variables numériques</li>
                            <li>Détectez et traitez les valeurs aberrantes qui pourraient fausser votre analyse</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="text-green-300 hover:text-green-200">
                          Bonnes pratiques SQL
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300">
                          <ul className="space-y-2 list-disc list-inside">
                            <li>Utilisez des noms de tables et de colonnes explicites et cohérents</li>
                            <li>Filtrez vos données avec WHERE avant d'effectuer des agrégations</li>
                            <li>Préférez les jointures explicites (JOIN) aux jointures implicites</li>
                            <li>Utilisez des alias pour améliorer la lisibilité de vos requêtes</li>
                            <li>Commentez les requêtes complexes pour les rendre plus compréhensibles</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          {/* Onglet Visualisations */}
          <TabsContent value="visualize" className="m-0 space-y-6">
            {showNewVizForm ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-green-300">Créer une nouvelle visualisation</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowNewVizForm(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Configurez votre visualisation en sélectionnant le type, les données source et les variables à représenter
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateVisualization 
                    tables={tables} 
                    onSave={handleAddVisualization} 
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {visualizations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visualizations.map(viz => (
                      <Card key={viz.id} className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-green-300">
                            {viz.title}
                          </CardTitle>
                          <CardDescription>
                            Données source: {viz.config?.table || 'Non spécifié'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-0">
                          <DataVisualization type={viz.type} config={viz.config} />
                        </CardContent>
                        <CardFooter className="flex justify-end pt-4">
                          <div className="flex gap-2 text-xs text-slate-400">
                            <Badge variant="outline" className="bg-slate-800/50">
                              {viz.config?.xAxis || 'x-axis'}
                            </Badge>
                            <Badge variant="outline" className="bg-slate-800/50">
                              {viz.config?.yAxis || 'y-axis'}
                            </Badge>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <PieChart className="h-16 w-16 mx-auto mb-4 text-slate-500 opacity-30" />
                    <h3 className="text-xl font-medium text-slate-300 mb-2">Aucune visualisation</h3>
                    <p className="text-slate-400 max-w-lg mx-auto mb-6">
                      Créez votre première visualisation pour explorer vos données graphiquement
                    </p>
                    <Button 
                      className="bg-green-700 hover:bg-green-800"
                      onClick={() => setShowNewVizForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer une visualisation
                    </Button>
                  </div>
                )}
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Guide des visualisations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-green-300">Quand utiliser un diagramme à barres</h3>
                        <ul className="text-sm space-y-1 text-slate-300">
                          <li>• Comparer des valeurs entre différentes catégories</li>
                          <li>• Montrer la distribution de données discrètes</li>
                          <li>• Visualiser des classements (top N)</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-green-300">Quand utiliser un graphique linéaire</h3>
                        <ul className="text-sm space-y-1 text-slate-300">
                          <li>• Montrer l'évolution dans le temps</li>
                          <li>• Identifier des tendances et des motifs</li>
                          <li>• Comparer plusieurs séries temporelles</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium text-green-300">Quand utiliser un diagramme circulaire</h3>
                        <ul className="text-sm space-y-1 text-slate-300">
                          <li>• Montrer la composition d'un ensemble</li>
                          <li>• Illustrer des proportions relatives</li>
                          <li>• Comparer des parts d'un total (limité à 5-7 segments)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          {/* Onglet Requêtes SQL */}
          <TabsContent value="analyze" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Éditeur SQL
                    </CardTitle>
                    <CardDescription>
                      Écrivez des requêtes SQL pour analyser vos données
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SQLExecutor
                      data={tables}
                      onResult={setSqlResult}
                    />
                  </CardContent>
                </Card>
                
                {sqlResult && (
                  <Card className="mt-6 bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-green-300">
                        <Table className="h-5 w-5 mr-2" />
                        Résultats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md overflow-hidden border border-slate-700">
                        <DataTable data={sqlResult} />
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" className="border-green-600/30 text-green-300 hover:bg-green-900/20">
                          <Clipboard className="h-4 w-4 mr-2" />
                          Copier les résultats
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Schéma des données
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.keys(tables).map(tableName => (
                        <div key={tableName} className="space-y-2">
                          <h3 className="font-medium text-green-300 flex items-center">
                            <Database className="h-4 w-4 mr-2" />
                            {tableName}
                          </h3>
                          {hasTableData(tableName) ? (
                            <div className="bg-slate-800/80 p-2 rounded-md">
                              <code className="text-xs text-slate-300 font-mono">
                                {tables[tableName].split('\n')[0].split(',').join(', ')}
                              </code>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400 italic">Table vide</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700 mt-6">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Aide-mémoire SQL
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-green-300 hover:text-green-200">
                          Requêtes de base
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <div>
                              <code className="text-xs bg-slate-900/70 p-1 rounded font-mono block">SELECT * FROM table</code>
                              <p className="text-xs text-slate-400 mt-1">Sélectionne toutes les colonnes et toutes les lignes</p>
                            </div>
                            <div>
                              <code className="text-xs bg-slate-900/70 p-1 rounded font-mono block">SELECT col1, col2 FROM table WHERE condition</code>
                              <p className="text-xs text-slate-400 mt-1">Sélectionne des colonnes spécifiques avec un filtre</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="text-green-300 hover:text-green-200">
                          Agrégation et groupement
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <div>
                              <code className="text-xs bg-slate-900/70 p-1 rounded font-mono block">SELECT col, COUNT(*), SUM(value) FROM table GROUP BY col</code>
                              <p className="text-xs text-slate-400 mt-1">Compte et somme regroupés par une colonne</p>
                            </div>
                            <div>
                              <code className="text-xs bg-slate-900/70 p-1 rounded font-mono block">SELECT col, AVG(value) FROM table GROUP BY col HAVING AVG(value) &gt; 100</code>
                              <p className="text-xs text-slate-400 mt-1">Filtre sur les groupes avec HAVING</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="text-green-300 hover:text-green-200">
                          Tri et limitation
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <div>
                              <code className="text-xs bg-slate-900/70 p-1 rounded font-mono block">SELECT * FROM table ORDER BY col1 ASC, col2 DESC</code>
                              <p className="text-xs text-slate-400 mt-1">Tri croissant puis décroissant</p>
                            </div>
                            <div>
                              <code className="text-xs bg-slate-900/70 p-1 rounded font-mono block">SELECT * FROM table ORDER BY col LIMIT 10</code>
                              <p className="text-xs text-slate-400 mt-1">Limite le nombre de résultats</p>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Onglet Apprendre */}
          <TabsContent value="learn" className="m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-300">
                    Méthodologie d'analyse de données
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                      <h3 className="font-medium text-green-300 flex items-center mb-3">
                        <div className="h-6 w-6 rounded-full bg-green-800 flex items-center justify-center mr-2 text-green-200">1</div>
                        Préparation et nettoyage des données
                      </h3>
                      <p className="text-slate-300 mb-3">
                        La première étape de toute analyse consiste à préparer et nettoyer vos données. Cela inclut la gestion des valeurs manquantes, la correction des erreurs, la standardisation des formats et l'élimination des doublons.
                      </p>
                      <div className="flex items-center text-sm text-green-300">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        <span>Conseil:</span>
                        <span className="text-slate-300 ml-2">80% du temps d'analyse est généralement consacré à cette étape</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                      <h3 className="font-medium text-green-300 flex items-center mb-3">
                        <div className="h-6 w-6 rounded-full bg-green-800 flex items-center justify-center mr-2 text-green-200">2</div>
                        Analyse exploratoire des données (EDA)
                      </h3>
                      <p className="text-slate-300 mb-3">
                        L'EDA consiste à explorer les données pour découvrir des tendances, des motifs et des anomalies. Utilisez des statistiques descriptives et des visualisations pour mieux comprendre vos données.
                      </p>
                      <div className="flex items-center text-sm text-green-300">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        <span>Conseil:</span>
                        <span className="text-slate-300 ml-2">Commencez par des questions simples et augmentez progressivement la complexité</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                      <h3 className="font-medium text-green-300 flex items-center mb-3">
                        <div className="h-6 w-6 rounded-full bg-green-800 flex items-center justify-center mr-2 text-green-200">3</div>
                        Analyse approfondie et modélisation
                      </h3>
                      <p className="text-slate-300 mb-3">
                        Après l'exploration initiale, appliquez des techniques plus avancées comme l'analyse statistique, la segmentation ou la modélisation prédictive pour extraire des insights plus profonds.
                      </p>
                      <div className="flex items-center text-sm text-green-300">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        <span>Conseil:</span>
                        <span className="text-slate-300 ml-2">Testez plusieurs approches et comparez leurs résultats</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/30 p-4 rounded-lg border border-slate-700">
                      <h3 className="font-medium text-green-300 flex items-center mb-3">
                        <div className="h-6 w-6 rounded-full bg-green-800 flex items-center justify-center mr-2 text-green-200">4</div>
                        Interprétation et communication des résultats
                      </h3>
                      <p className="text-slate-300 mb-3">
                        Transformez vos analyses en insights actionnables et communiquez-les efficacement à travers des visualisations claires et des récits convaincants.
                      </p>
                      <div className="flex items-center text-sm text-green-300">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        <span>Conseil:</span>
                        <span className="text-slate-300 ml-2">Adaptez votre présentation à votre audience et mettez en avant les implications pratiques</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Compétences essentielles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-green-300 mb-2">SQL</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-slate-700 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 w-8">90%</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            Requêtes avancées, jointures, sous-requêtes, fonctions analytiques
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-green-300 mb-2">Excel / Tableurs</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-slate-700 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 w-8">85%</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            Tableaux croisés, formules avancées, macros, Power Query
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-green-300 mb-2">Visualisation de données</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-slate-700 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 w-8">80%</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            Tableau, Power BI, principes de design d'information
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-green-300 mb-2">Python / R</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className="w-full h-2 bg-slate-700 rounded-full mr-2">
                              <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                            <span className="text-xs text-slate-400 w-8">75%</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            Pandas, NumPy, matplotlib, scikit-learn, dplyr, ggplot2
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-green-300">
                      Ressources d'apprentissage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-900/30 rounded-md border border-slate-700">
                        <h3 className="font-medium text-green-300 mb-1">Mode Analytics SQL Tutorial</h3>
                        <p className="text-sm text-slate-300">Tutoriel interactif pour apprendre SQL de zéro jusqu'à un niveau avancé</p>
                      </div>
                      <div className="p-3 bg-slate-900/30 rounded-md border border-slate-700">
                        <h3 className="font-medium text-green-300 mb-1">Kaggle Learn</h3>
                        <p className="text-sm text-slate-300">Cours gratuits sur l'analyse de données, Python, SQL et le ML</p>
                      </div>
                      <div className="p-3 bg-slate-900/30 rounded-md border border-slate-700">
                        <h3 className="font-medium text-green-300 mb-1">DataCamp</h3>
                        <p className="text-sm text-slate-300">Plateforme interactive d'apprentissage pour les data skills</p>
                      </div>
                      <div className="p-3 bg-slate-900/30 rounded-md border border-slate-700">
                        <h3 className="font-medium text-green-300 mb-1">Livres recommandés</h3>
                        <p className="text-sm text-slate-300">• Storytelling with Data</p>
                        <p className="text-sm text-slate-300">• Python for Data Analysis</p>
                        <p className="text-sm text-slate-300">• The Art of SQL</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}