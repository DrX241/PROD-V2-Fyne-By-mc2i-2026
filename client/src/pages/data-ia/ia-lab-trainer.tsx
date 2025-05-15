import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import Editor from '@monaco-editor/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Terminal,
  Brain,
  Code,
  PlayCircle,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Settings2,
  Database,
  Sparkles,
  Lightbulb,
  Loader2,
  PanelLeft,
  PanelRight,
  Download,
  Share2,
  Copy,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTopNavigation from '@/components/DataTopNavigation';

// Types
interface CodeExecution {
  code: string;
  language: 'python' | 'sql';
  result: string;
  analysis: string | null;
  timestamp: number;
}

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: 'python' | 'sql';
  level: 'débutant' | 'intermédiaire' | 'avancé';
  tags: string[];
}

// Exemples prédéfinis de code Python
const pythonExamples: CodeExample[] = [
  {
    title: "Analyse de données avec Pandas",
    description: "Un exemple de manipulation de données avec Pandas pour l'analyse.",
    code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Créer un DataFrame d'exemple
data = {
    'Age': [25, 30, 35, 40, 45, 50, 55, 60, 65],
    'Salaire': [50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000, 130000],
    'Experience': [1, 3, 5, 7, 9, 11, 13, 15, 17]
}

df = pd.DataFrame(data)

# Afficher des statistiques descriptives
print(df.describe())

# Calculer une corrélation
correlation = df['Age'].corr(df['Salaire'])
print(f"Corrélation entre l'âge et le salaire: {correlation:.2f}")

# Créer un graphique (dans un environnement supportant les graphiques)
# plt.scatter(df['Age'], df['Salaire'])
# plt.title('Relation entre l'âge et le salaire')
# plt.xlabel('Âge')
# plt.ylabel('Salaire')
# plt.show()

# Filtrer les données
seniors = df[df['Age'] > 50]
print("\nEmployés seniors:")
print(seniors)

# Ajouter une nouvelle colonne calculée
df['Salaire_par_experience'] = df['Salaire'] / df['Experience']
print("\nDataFrame avec nouvelle colonne:")
print(df.head())`,
    language: 'python',
    level: 'intermédiaire',
    tags: ['pandas', 'data-analysis', 'statistics']
  },
  {
    title: "Machine Learning avec Scikit-learn",
    description: "Un exemple simple de classification avec scikit-learn.",
    code: `import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Générer des données synthétiques
X = np.random.rand(100, 5)  # 100 échantillons avec 5 caractéristiques
y = (X[:, 0] + X[:, 1] > 1).astype(int)  # Classe basée sur la somme des 2 premières caractéristiques

# Diviser en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Créer et entraîner un modèle de forêt aléatoire
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Prédire sur l'ensemble de test
y_pred = model.predict(X_test)

# Évaluer les performances
accuracy = accuracy_score(y_test, y_pred)
print(f"Précision du modèle: {accuracy:.2f}")

# Afficher un rapport de classification détaillé
print("\\nRapport de classification:")
report = classification_report(y_test, y_pred)
print(report)

# Importance des caractéristiques
feature_importance = model.feature_importances_
print("\\nImportance des caractéristiques:")
for i, importance in enumerate(feature_importance):
    print(f"Caractéristique {i+1}: {importance:.4f}")`,
    language: 'python',
    level: 'avancé',
    tags: ['machine-learning', 'scikit-learn', 'classification']
  },
  {
    title: "Concepts de base de Python",
    description: "Un exemple de base pour les débutants en Python.",
    code: `# Variables et types de données
nom = "Alice"
age = 30
taille = 1.75
est_etudiant = False

# Affichage et concaténation
print("Informations personnelles:")
print("Nom:", nom)
print("Âge:", age, "ans")
print("Taille:", taille, "m")
print("Est étudiant:", est_etudiant)

# Structures conditionnelles
if age < 18:
    print(nom, "est mineur(e).")
elif age >= 65:
    print(nom, "est à la retraite.")
else:
    print(nom, "est un(e) adulte en âge de travailler.")

# Boucles
print("\\nCompte à rebours:")
for i in range(5, 0, -1):
    print(i)
print("Décollage!")

# Listes
fruits = ["pomme", "banane", "orange", "fraise", "kiwi"]
print("\\nListe de fruits:")
for index, fruit in enumerate(fruits):
    print(f"{index+1}. {fruit}")

# Fonctions
def calculer_imc(poids, taille):
    return poids / (taille ** 2)

poids = 70
imc = calculer_imc(poids, taille)
print(f"\\nPour un poids de {poids}kg et une taille de {taille}m:")
print(f"IMC = {imc:.2f}")

# Dictionnaires
personne = {
    "nom": nom,
    "age": age,
    "taille": taille,
    "poids": poids,
    "imc": imc
}

print("\\nInformations sous forme de dictionnaire:")
for cle, valeur in personne.items():
    print(f"{cle}: {valeur}")`,
    language: 'python',
    level: 'débutant',
    tags: ['basics', 'programming', 'beginners']
  }
];

// Exemples prédéfinis de code SQL
const sqlExamples: CodeExample[] = [
  {
    title: "Requêtes SQL de base",
    description: "Exemples de requêtes SQL fondamentales.",
    code: `-- Sélection simple
SELECT * FROM clients LIMIT 5;

-- Filtrage avec WHERE
SELECT nom, prenom, email
FROM clients
WHERE ville = 'Paris'
ORDER BY nom ASC;

-- Agrégation avec GROUP BY
SELECT ville, COUNT(*) as nombre_clients
FROM clients
GROUP BY ville
ORDER BY nombre_clients DESC;

-- Jointure simple
SELECT c.nom, c.prenom, c.email, c.telephone, 
       co.date, co.montant
FROM clients c
JOIN commandes co ON c.id = co.client_id
WHERE co.montant > 1000
ORDER BY co.montant DESC;

-- Sous-requête
SELECT nom, prenom, email
FROM clients
WHERE id IN (
    SELECT DISTINCT client_id
    FROM commandes
    WHERE montant > 5000
);`,
    language: 'sql',
    level: 'débutant',
    tags: ['basics', 'queries', 'beginners']
  },
  {
    title: "Requêtes SQL avancées",
    description: "Exemples de requêtes SQL plus complexes incluant des CTE, window functions, etc.",
    code: `-- Common Table Expression (CTE)
WITH clients_actifs AS (
    SELECT client_id, COUNT(*) as nb_commandes, SUM(montant) as total_depense
    FROM commandes
    WHERE date_commande >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
    GROUP BY client_id
    HAVING COUNT(*) >= 3
)
SELECT c.nom, c.prenom, c.email, ca.nb_commandes, ca.total_depense
FROM clients c
JOIN clients_actifs ca ON c.id = ca.client_id
ORDER BY ca.total_depense DESC;

-- Window Functions
SELECT 
    c.nom,
    c.prenom,
    d.nom_departement,
    e.salaire,
    AVG(e.salaire) OVER (PARTITION BY d.id) as salaire_moyen_departement,
    e.salaire - AVG(e.salaire) OVER (PARTITION BY d.id) as difference_moyenne,
    RANK() OVER (PARTITION BY d.id ORDER BY e.salaire DESC) as classement_salaire
FROM employes e
JOIN departements d ON e.departement_id = d.id
JOIN collaborateurs c ON e.collaborateur_id = c.id
ORDER BY d.nom_departement, classement_salaire;

-- PIVOT (syntaxe SQL Server)
-- Pour MySQL, il faudrait utiliser des CASE WHEN
SELECT 
    produit_id,
    SUM(CASE WHEN MONTH(date_vente) = 1 THEN quantite ELSE 0 END) as Jan,
    SUM(CASE WHEN MONTH(date_vente) = 2 THEN quantite ELSE 0 END) as Feb,
    SUM(CASE WHEN MONTH(date_vente) = 3 THEN quantite ELSE 0 END) as Mar,
    SUM(CASE WHEN MONTH(date_vente) = 4 THEN quantite ELSE 0 END) as Apr
FROM ventes
WHERE YEAR(date_vente) = 2023
GROUP BY produit_id
ORDER BY produit_id;`,
    language: 'sql',
    level: 'avancé',
    tags: ['advanced', 'cte', 'window-functions']
  },
  {
    title: "Optimisation de requêtes SQL",
    description: "Exemple de requêtes SQL et leurs versions optimisées.",
    code: `-- Exemple 1: Requête non optimisée
SELECT *
FROM commandes c
JOIN clients cl ON c.client_id = cl.id
WHERE YEAR(c.date_commande) = 2023;

-- Exemple 1: Version optimisée
SELECT c.id, c.date_commande, c.montant, c.statut,
       cl.nom, cl.prenom, cl.email
FROM commandes c
JOIN clients cl ON c.client_id = cl.id
WHERE c.date_commande >= '2023-01-01' 
  AND c.date_commande < '2024-01-01';

-- Exemple 2: Sous-requête non optimisée
SELECT *
FROM produits
WHERE categorie_id IN (
    SELECT id FROM categories WHERE nom LIKE '%électronique%'
);

-- Exemple 2: Version optimisée avec JOIN
SELECT p.*
FROM produits p
JOIN categories c ON p.categorie_id = c.id
WHERE c.nom LIKE '%électronique%';

-- Exemple 3: Agrégation non optimisée
SELECT client_id, COUNT(*)
FROM commandes
GROUP BY client_id
HAVING COUNT(*) > 5;

-- Exemple 3: Version optimisée avec CTE
WITH commandes_par_client AS (
    SELECT client_id, COUNT(*) as nb_commandes
    FROM commandes
    GROUP BY client_id
)
SELECT client_id, nb_commandes
FROM commandes_par_client
WHERE nb_commandes > 5;

-- EXPLAIN peut être utilisé pour analyser l'exécution des requêtes
-- EXPLAIN SELECT * FROM commandes WHERE client_id = 123;`,
    language: 'sql',
    level: 'intermédiaire',
    tags: ['optimization', 'performance', 'best-practices']
  }
];

const IALabTrainer: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // État pour le code et l'éditeur
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'sql'>('python');
  const [code, setCode] = useState('');
  const [editorHeight, setEditorHeight] = useState('500px');
  const [expandEditor, setExpandEditor] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // États pour les résultats
  const [result, setResult] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [executionHistory, setExecutionHistory] = useState<CodeExecution[]>([]);
  
  // État pour le titre et la description du code actuel
  const [codeTitle, setCodeTitle] = useState('');
  const [codeDescription, setCodeDescription] = useState('');
  
  // Effet pour charger un exemple par défaut au chargement
  useEffect(() => {
    const defaultExample = selectedLanguage === 'python' 
      ? pythonExamples[2]  // Exemple débutant pour Python
      : sqlExamples[0];    // Exemple débutant pour SQL
      
    setCode(defaultExample.code);
    setCodeTitle(defaultExample.title);
    setCodeDescription(defaultExample.description);
  }, []);
  
  // Effet pour ajuster la hauteur de l'éditeur
  useEffect(() => {
    setEditorHeight(expandEditor ? '700px' : '500px');
  }, [expandEditor]);
  
  // Fonction pour changer de langage
  const handleLanguageChange = (language: 'python' | 'sql') => {
    if (language === selectedLanguage) return;
    
    // Demander confirmation si le code a été modifié
    if (code.trim() !== '') {
      const defaultCode = selectedLanguage === 'python' 
        ? pythonExamples[2].code 
        : sqlExamples[0].code;
      
      if (code !== defaultCode) {
        const confirm = window.confirm(
          "Changer de langage effacera votre code actuel. Continuer ?"
        );
        if (!confirm) return;
      }
    }
    
    setSelectedLanguage(language);
    
    // Charger un exemple par défaut pour le nouveau langage
    const defaultExample = language === 'python' 
      ? pythonExamples[2] 
      : sqlExamples[0];
      
    setCode(defaultExample.code);
    setCodeTitle(defaultExample.title);
    setCodeDescription(defaultExample.description);
    setResult('');
    setAnalysis(null);
  };
  
  // Fonction pour exécuter le code avec l'IA
  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer du code avant d'exécuter.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setResult('');
    setAnalysis(null);
    
    try {
      // Déterminer l'endpoint en fonction du langage sélectionné
      const endpoint = selectedLanguage === 'python' 
        ? '/api/code/execute/python'
        : '/api/code/execute/sql';
      
      // Appeler l'API d'exécution de code
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'exécution du code');
      }
      
      const data = await response.json();
      
      // Mettre à jour les résultats avec la réponse de l'API
      setResult(data.result || 'Exécution terminée sans résultat');
      setAnalysis(data.analysis || 'Aucune analyse disponible');
      
      // Ajouter à l'historique
      const newExecution: CodeExecution = {
        code,
        language: selectedLanguage,
        result: data.result || 'Aucun résultat',
        analysis: data.analysis || 'Aucune analyse',
        timestamp: Date.now()
      };
      
      setExecutionHistory(prev => [newExecution, ...prev].slice(0, 10));
      
      toast({
        title: "Exécution terminée",
        description: "Le code a été exécuté avec succès.",
        variant: "default",
      });
    } catch (error) {
      setResult("Erreur lors de l'exécution");
      setAnalysis(`Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'exécution du code.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Charger un exemple de code
  const loadExample = (example: CodeExample) => {
    setCode(example.code);
    setCodeTitle(example.title);
    setCodeDescription(example.description);
    setShowExamples(false);
    setResult('');
    setAnalysis(null);
    
    toast({
      title: "Exemple chargé",
      description: `L'exemple "${example.title}" a été chargé.`,
      variant: "default",
    });
  };
  
  // Fonction pour nettoyer l'éditeur
  const clearEditor = () => {
    const confirm = window.confirm("Voulez-vous vraiment effacer tout le code ?");
    if (confirm) {
      setCode('');
      setCodeTitle('');
      setCodeDescription('');
      setResult('');
      setAnalysis(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <DataTopNavigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation('/data-ia')}
              className="mr-3 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Brain className="mr-3 h-6 w-6 text-cyan-400" />
                IA LAB TRAINER
              </h1>
              <p className="text-gray-400">
                Développez vos compétences en programmation avec l'aide de l'IA
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="flex items-center rounded-lg border border-blue-500/30 bg-blue-900/20 px-1">
              <button
                className={`flex items-center rounded px-4 py-1.5 ${
                  selectedLanguage === 'python' ? 'bg-blue-800 text-white' : 'text-blue-300'
                }`}
                onClick={() => handleLanguageChange('python')}
              >
                <Code className="mr-2 h-4 w-4" />
                Python
              </button>
              <button
                className={`flex items-center rounded px-4 py-1.5 ${
                  selectedLanguage === 'sql' ? 'bg-blue-800 text-white' : 'text-blue-300'
                }`}
                onClick={() => handleLanguageChange('sql')}
              >
                <Database className="mr-2 h-4 w-4" />
                SQL
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Panneau principal - Éditeur et Résultats */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-blue-900/70 to-slate-900/70 border-blue-500/20">
            <CardHeader className="border-b border-blue-500/20 pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white flex items-center">
                    <Terminal className="mr-2 h-5 w-5 text-cyan-400" />
                    Éditeur {selectedLanguage === 'python' ? 'Python' : 'SQL'}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {codeTitle ? codeTitle : "Éditer et exécuter votre code"}
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExamples(!showExamples)}
                    className="border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Exemples
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandEditor(!expandEditor)}
                    className="border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  >
                    {expandEditor ? (
                      <PanelLeft className="h-4 w-4" />
                    ) : (
                      <PanelRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Description du code (si disponible) */}
              {codeDescription && (
                <div className="mt-2 text-gray-300 text-sm">
                  {codeDescription}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              <div style={{ height: editorHeight }} className="border-b border-blue-500/20">
                <Editor
                  height={editorHeight}
                  language={selectedLanguage}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    autoIndent: 'full',
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: 2,
                    automaticLayout: true,
                    lineNumbers: 'on',
                  }}
                  loading={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-6 w-6 text-blue-400" /></div>}
                />
              </div>
              
              {/* Résultats d'exécution */}
              {(result || isProcessing) && (
                <div className="p-4 bg-gray-900/80">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold flex items-center">
                      <PlayCircle className="mr-2 h-4 w-4 text-green-400" />
                      Résultat
                    </h3>
                  </div>
                  
                  {isProcessing ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin h-5 w-5 mr-2 text-blue-400" />
                      <span className="text-gray-300">Exécution du code...</span>
                    </div>
                  ) : (
                    <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm bg-black/30 p-3 rounded-md max-h-56 overflow-auto">
                      {result}
                    </pre>
                  )}
                </div>
              )}
              
              {/* Analyse IA */}
              {analysis && !isProcessing && (
                <div className="p-4 bg-gradient-to-r from-gray-900/90 to-blue-900/30 border-t border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold flex items-center">
                      <Brain className="mr-2 h-4 w-4 text-purple-400" />
                      Analyse IA du code
                    </h3>
                    <Badge variant="outline" className="bg-purple-900/40 text-purple-300 border-purple-500/30">
                      Intelligence artificielle
                    </Badge>
                  </div>
                  
                  <div className="text-gray-200 whitespace-pre-wrap text-sm bg-black/40 p-4 rounded-md max-h-60 overflow-auto shadow-inner border border-blue-500/10">
                    {/* Utilisation d'un div avec des classes pour styliser le contenu de l'analyse */}
                    <div className="prose prose-sm prose-invert max-w-none">
                      {analysis}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="ghost" 
                      size="sm"
                      className="text-xs h-7 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      onClick={() => {
                        // Copier l'analyse dans le presse-papier
                        navigator.clipboard.writeText(analysis);
                        toast({
                          title: "Analyse copiée",
                          description: "L'analyse IA a été copiée dans le presse-papier",
                          variant: "default",
                        });
                      }}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copier l'analyse
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t border-blue-500/20 py-3 flex justify-between">
              <Button
                variant="outline"
                onClick={clearEditor}
                className="border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                disabled={isProcessing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Effacer
              </Button>
              
              <Button
                onClick={executeCode}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exécution...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Exécuter
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Panneau de droite - Exemples ou Historique */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-blue-500/20 overflow-hidden">
            <Tabs defaultValue="examples" className="h-full flex flex-col">
              <div className="border-b border-blue-500/20 px-4">
                <TabsList className="bg-transparent border-b-0 py-2 justify-start">
                  <TabsTrigger value="examples" className="data-[state=active]:bg-blue-800/40 rounded-md px-4">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Exemples
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-blue-800/40 rounded-md px-4">
                    <Terminal className="h-4 w-4 mr-2" />
                    Historique
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="examples" className="flex-grow overflow-auto p-4">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-cyan-400" />
                    Exemples de code {selectedLanguage === 'python' ? 'Python' : 'SQL'}
                  </h3>
                  
                  <div className="space-y-3">
                    {(selectedLanguage === 'python' ? pythonExamples : sqlExamples).map((example, idx) => (
                      <div 
                        key={idx}
                        className="border border-blue-500/20 bg-blue-900/20 rounded-md p-3 hover:bg-blue-800/30 cursor-pointer transition-colors"
                        onClick={() => loadExample(example)}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="text-white font-medium">{example.title}</h4>
                          <Badge variant="outline" className="text-xs bg-blue-900/50 border-blue-700/30">
                            {example.level}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{example.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {example.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="bg-blue-800/30 text-blue-300 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="flex-grow overflow-auto p-4">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <Terminal className="mr-2 h-5 w-5 text-cyan-400" />
                    Historique d'exécution ({executionHistory.length})
                  </h3>
                  
                  {executionHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Code className="h-8 w-8 mx-auto mb-2 text-blue-500/50" />
                      <p>Aucun historique disponible</p>
                      <p className="text-sm mt-1">Exécutez du code pour voir l'historique</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {executionHistory.map((item, idx) => (
                        <div key={idx} className="border border-blue-500/20 bg-blue-900/20 rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-medium">
                              {item.language === 'python' ? 'Python' : 'SQL'} - Exécution {idx + 1}
                            </h4>
                            <Badge variant="outline" className="text-xs bg-blue-900/50 border-blue-700/30">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </Badge>
                          </div>
                          <pre className="text-gray-300 text-xs mt-2 line-clamp-2 font-mono">
                            {item.code.substring(0, 100)}{item.code.length > 100 ? '...' : ''}
                          </pre>
                          <div className="flex mt-2 space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCode(item.code)}
                              className="text-xs h-7 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            >
                              <Code className="mr-1 h-3 w-3" />
                              Charger
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IALabTrainer;