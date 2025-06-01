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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Trophy,
  Award,
} from 'lucide-react';
import ChallengeMode from '@/components/ia-lab/ChallengeMode';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DataTopNavigation from '@/components/DataTopNavigation';

// Types
interface CodeExecution {
  code: string;
  language: 'python' | 'sql' | 'vba' | 'dax';
  result: string;
  analysis: string | null;
  timestamp: number;
  sessionVariables?: string | null;
}

interface CodeExample {
  title: string;
  description: string;
  code: string;
  language: 'python' | 'sql' | 'vba' | 'dax';
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
nom = "mc2i"
age = 35
taille = 1500
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
expertise = ["cyber", "agilité", "amoa", "data&IA", "UX/UI"]
print("\\nListe des expertises:")
for index, expertise in enumerate(expertise):
    print(f"{index+1}. {expertise}")

# Fonctions
def calculer_imc(poids, taille):
    return poids / (taille ** 2)

poids = 180
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

// Exemples prédéfinis de code VBA
const vbaExamples: CodeExample[] = [
  {
    title: "Automatisation Excel de base",
    description: "Exemple simple d'automatisation Excel avec VBA.",
    code: `Sub AnalyseVentes()
    ' Déclarer les variables
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim total As Double
    Dim moyenne As Double
    Dim i As Integer
    
    ' Définir la feuille de travail active
    Set ws = ActiveSheet
    
    ' Trouver la dernière ligne avec des données
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    ' Calculer le total des ventes (colonne B)
    For i = 2 To lastRow
        total = total + ws.Cells(i, 2).Value
    Next i
    
    ' Calculer la moyenne
    moyenne = total / (lastRow - 1)
    
    ' Afficher les résultats
    ws.Cells(lastRow + 2, 1).Value = "Total:"
    ws.Cells(lastRow + 2, 2).Value = total
    ws.Cells(lastRow + 3, 1).Value = "Moyenne:"
    ws.Cells(lastRow + 3, 2).Value = moyenne
    
    ' Formater les cellules
    ws.Range("B" & (lastRow + 2) & ":B" & (lastRow + 3)).NumberFormat = "0.00"
    ws.Range("A" & (lastRow + 2) & ":B" & (lastRow + 3)).Font.Bold = True
    
    MsgBox "Analyse terminée! Total: " & Format(total, "0.00") & ", Moyenne: " & Format(moyenne, "0.00")
End Sub`,
    language: 'vba',
    level: 'débutant',
    tags: ['excel', 'automation', 'calculs']
  },
  {
    title: "Création de rapports automatisés",
    description: "Automatisation de création de rapports avec mise en forme.",
    code: `Sub CreerRapportVentes()
    Dim wsData As Worksheet
    Dim wsRapport As Worksheet
    Dim lastRow As Long
    Dim i As Integer
    
    ' Créer une nouvelle feuille pour le rapport
    Set wsData = Sheets("Données")
    Set wsRapport = Sheets.Add(After:=Sheets(Sheets.Count))
    wsRapport.Name = "Rapport_" & Format(Date, "yyyy_mm_dd")
    
    ' En-têtes du rapport
    With wsRapport
        .Cells(1, 1).Value = "RAPPORT DE VENTES"
        .Cells(1, 1).Font.Size = 16
        .Cells(1, 1).Font.Bold = True
        .Range("A1:D1").Merge
        .Range("A1").HorizontalAlignment = xlCenter
        
        .Cells(3, 1).Value = "Produit"
        .Cells(3, 2).Value = "Quantité"
        .Cells(3, 3).Value = "Prix Unitaire"
        .Cells(3, 4).Value = "Total"
        .Range("A3:D3").Font.Bold = True
        .Range("A3:D3").Interior.Color = RGB(200, 200, 200)
    End With
    
    ' Copier et traiter les données
    lastRow = wsData.Cells(wsData.Rows.Count, "A").End(xlUp).Row
    For i = 2 To lastRow
        wsRapport.Cells(i + 2, 1).Value = wsData.Cells(i, 1).Value
        wsRapport.Cells(i + 2, 2).Value = wsData.Cells(i, 2).Value
        wsRapport.Cells(i + 2, 3).Value = wsData.Cells(i, 3).Value
        wsRapport.Cells(i + 2, 4).Formula = "=B" & (i + 2) & "*C" & (i + 2)
    Next i
    
    ' Mise en forme finale
    With wsRapport.Range("A3:D" & (lastRow + 1))
        .Borders.LineStyle = xlContinuous
        .VerticalAlignment = xlCenter
    End With
    
    wsRapport.Columns("A:D").AutoFit
    MsgBox "Rapport créé avec succès!"
End Sub`,
    language: 'vba',
    level: 'intermédiaire',
    tags: ['excel', 'rapports', 'mise-en-forme']
  }
];

// Exemples prédéfinis de code DAX
const daxExamples: CodeExample[] = [
  {
    title: "Mesures de base en DAX",
    description: "Calculs fondamentaux avec DAX pour Power BI.",
    code: `// Chiffre d'affaires total
CA Total = SUM(Ventes[Montant])

// Nombre de transactions
Nb Transactions = COUNTROWS(Ventes)

// Panier moyen
Panier Moyen = DIVIDE([CA Total], [Nb Transactions], 0)

// CA de l'année précédente
CA Année Précédente = 
CALCULATE(
    [CA Total],
    SAMEPERIODLASTYEAR(Calendrier[Date])
)

// Évolution vs année précédente
Evolution YoY = 
DIVIDE(
    [CA Total] - [CA Année Précédente],
    [CA Année Précédente],
    0
)

// CA cumulé depuis le début de l'année
CA YTD = 
TOTALYTD(
    [CA Total],
    Calendrier[Date]
)

// Pourcentage du total
% du Total = 
DIVIDE(
    [CA Total],
    CALCULATE([CA Total], ALL(Produits)),
    0
)`,
    language: 'dax',
    level: 'débutant',
    tags: ['power-bi', 'mesures', 'time-intelligence']
  },
  {
    title: "Analyses temporelles avancées",
    description: "Calculs DAX avancés avec intelligence temporelle.",
    code: `// Moyenne mobile sur 3 mois
Moyenne Mobile 3M = 
VAR CurrentDate = MAX(Calendrier[Date])
VAR StartDate = EOMONTH(CurrentDate, -3) + 1
VAR EndDate = EOMONTH(CurrentDate, 0)
RETURN
CALCULATE(
    AVERAGE(Ventes[Montant]),
    DATESBETWEEN(Calendrier[Date], StartDate, EndDate)
)

// Top 10 des produits par CA
Top 10 Produits = 
VAR CurrentProduct = MAX(Produits[Nom])
VAR ProductRank = 
RANKX(
    ALL(Produits[Nom]),
    [CA Total],
    ,
    DESC
)
RETURN
IF(ProductRank <= 10, [CA Total], BLANK())

// Clients récurrents
Clients Récurrents = 
SUMX(
    VALUES(Clients[ID]),
    VAR NbCommandes = 
    CALCULATE(
        COUNTROWS(Ventes),
        ALLEXCEPT(Ventes, Clients[ID])
    )
    RETURN
    IF(NbCommandes > 1, 1, 0)
)

// Taux de croissance trimestriel
Croissance Trimestrielle = 
VAR CurrentQuarter = [CA Total]
VAR PreviousQuarter = 
CALCULATE(
    [CA Total],
    PREVIOUSQUARTER(Calendrier[Date])
)
RETURN
DIVIDE(
    CurrentQuarter - PreviousQuarter,
    PreviousQuarter,
    0
)`,
    language: 'dax',
    level: 'avancé',
    tags: ['power-bi', 'time-intelligence', 'analytics', 'kpi']
  }
];

// Fonction pour mapper les langages à Monaco Editor
const getEditorLanguage = (language: 'python' | 'sql' | 'vba' | 'dax') => {
  switch(language) {
    case 'python': return 'python';
    case 'sql': return 'sql';
    case 'vba': return 'vba';
    case 'dax': return 'dax';
    default: return 'python';
  }
};

const IALabTrainer: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // État pour le code et l'éditeur
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'sql' | 'vba' | 'dax'>('python');
  const [code, setCode] = useState('');
  const [editorHeight, setEditorHeight] = useState('500px');
  const [expandEditor, setExpandEditor] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // État pour le composant de traduction IA
  const [showTranslator, setShowTranslator] = useState(false);
  const [naturalText, setNaturalText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<'python' | 'sql' | 'vba' | 'dax'>('python');
  
  // États pour les résultats
  const [result, setResult] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [executionHistory, setExecutionHistory] = useState<CodeExecution[]>([]);
  const [sessionVariables, setSessionVariables] = useState<string | null>(null);
  
  // État pour le titre et la description du code actuel
  const [codeTitle, setCodeTitle] = useState('');
  const [codeDescription, setCodeDescription] = useState('');
  
  // ID de session unique pour l'utilisateur
  const [sessionId] = useState<string>(() => {
    // Générer un ID de session unique
    return `session_${Math.random().toString(36).substring(2, 15)}`;
  });
  
  // Effet pour charger un exemple par défaut au chargement
  useEffect(() => {
    let defaultExample;
    switch(selectedLanguage) {
      case 'python':
        defaultExample = pythonExamples[2];
        break;
      case 'sql':
        defaultExample = sqlExamples[0];
        break;
      case 'vba':
        defaultExample = vbaExamples[0];
        break;
      case 'dax':
        defaultExample = daxExamples[0];
        break;
      default:
        defaultExample = pythonExamples[2];
    }
      
    setCode(defaultExample.code);
    setCodeTitle(defaultExample.title);
    setCodeDescription(defaultExample.description);
  }, []);
  
  // Effet pour ajuster la hauteur de l'éditeur
  useEffect(() => {
    setEditorHeight(expandEditor ? '700px' : '500px');
  }, [expandEditor]);
  
  // Fonction pour changer de langage
  const handleLanguageChange = (language: 'python' | 'sql' | 'vba' | 'dax') => {
    if (language === selectedLanguage) return;
    
    // Demander confirmation si le code a été modifié et n'est pas undefined
    if (code && code.trim() !== '') {
      let defaultCode;
      switch(selectedLanguage) {
        case 'python':
          defaultCode = pythonExamples[2].code;
          break;
        case 'sql':
          defaultCode = sqlExamples[0].code;
          break;
        case 'vba':
          defaultCode = vbaExamples[0].code;
          break;
        case 'dax':
          defaultCode = daxExamples[0].code;
          break;
        default:
          defaultCode = pythonExamples[2].code;
      }
      
      if (code !== defaultCode) {
        const confirm = window.confirm(
          "Changer de langage effacera votre code actuel. Continuer ?"
        );
        if (!confirm) return;
      }
    }
    
    setSelectedLanguage(language);
    
    // Charger un exemple par défaut pour le nouveau langage
    let defaultExample;
    switch(language) {
      case 'python':
        defaultExample = pythonExamples[2];
        break;
      case 'sql':
        defaultExample = sqlExamples[0];
        break;
      case 'vba':
        defaultExample = vbaExamples[0];
        break;
      case 'dax':
        defaultExample = daxExamples[0];
        break;
      default:
        defaultExample = pythonExamples[2];
    }
      
    setCode(defaultExample.code);
    setCodeTitle(defaultExample.title);
    setCodeDescription(defaultExample.description);
    setResult('');
    setAnalysis(null);
  };
  
  // Fonction pour traduire du langage naturel en code avec l'IA
  const translateToCode = async (text: string, language: 'python' | 'sql' | 'vba' | 'dax' = targetLanguage) => {
    if (!text.trim()) {
      return;
    }
    
    setIsProcessing(true);
    setResult('');
    setAnalysis(null);
    
    try {
      // Appel à l'API pour traduire le texte en code
      const response = await fetch('/api/code/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: text,
          language: language,
          sessionId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la traduction');
      }
      
      const data = await response.json();
      
      // Mettre à jour l'éditeur avec le code généré
      if (data.code) {
        setCode(data.code);
        setAnalysis(data.explanation || "Code généré à partir de votre description en langage naturel.");
        
        // Copier automatiquement le code dans le presse-papier
        navigator.clipboard.writeText(data.code).then(() => {
          toast({
            title: "Code généré et copié",
            description: "Le code a été généré et copié dans le presse-papier.",
            variant: "default",
          });
        }).catch(() => {
          toast({
            title: "Code généré",
            description: "Le code a été généré mais n'a pas pu être copié automatiquement.",
            variant: "default",
          });
        });
      } else {
        throw new Error("Aucun code n'a été généré");
      }
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      toast({
        title: "Erreur de traduction",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la traduction.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
        body: JSON.stringify({ 
          code,
          sessionId // Inclure l'ID de session pour maintenir le contexte entre les appels
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'exécution du code');
      }
      
      const data = await response.json();
      
      // Mettre à jour les résultats avec la réponse de l'API
      setResult(data.result || 'Exécution terminée sans résultat');
      setAnalysis(data.analysis || 'Aucune analyse disponible');
      
      // Mettre à jour les variables de session si disponibles
      if (data.sessionVariables) {
        setSessionVariables(data.sessionVariables);
      }
      
      // Ajouter à l'historique
      const newExecution: CodeExecution = {
        code,
        language: selectedLanguage,
        result: data.result || 'Aucun résultat',
        analysis: data.analysis || 'Aucune analyse',
        timestamp: Date.now(),
        sessionVariables: data.sessionVariables
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
  
  // Fonction pour réinitialiser les variables de session
  const resetSessionVariables = async () => {
    if (!sessionId) return;
    
    const confirm = window.confirm(
      "Voulez-vous vraiment réinitialiser toutes les variables de session ? " +
      "Cela supprimera toutes les variables Python et tables SQL temporaires créées."
    );
    
    if (!confirm) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/code/session/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          language: selectedLanguage,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionVariables(null);
        toast({
          title: "Variables réinitialisées",
          description: data.message || "Toutes les variables de session ont été réinitialisées",
          variant: "default",
        });
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la réinitialisation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des variables:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réinitialisation des variables",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
              onClick={() => setLocation('/data-ia/roleplay')}
              className="mr-3 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Brain className="mr-3 h-6 w-6 text-cyan-400" />
                Je suis Data Scientist
              </h1>
              <p className="text-gray-400">
                Développez vos compétences en programmation avec l'aide de l'IA
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="flex items-center rounded-lg border border-blue-500/30 bg-blue-900/20 px-1">
              <button
                className={`flex items-center rounded px-3 py-1.5 ${
                  selectedLanguage === 'python' ? 'bg-blue-800 text-white' : 'text-blue-300'
                }`}
                onClick={() => handleLanguageChange('python')}
              >
                <Code className="mr-2 h-4 w-4" />
                Python
              </button>
              <button
                className={`flex items-center rounded px-3 py-1.5 ${
                  selectedLanguage === 'sql' ? 'bg-blue-800 text-white' : 'text-blue-300'
                }`}
                onClick={() => handleLanguageChange('sql')}
              >
                <Database className="mr-2 h-4 w-4" />
                SQL
              </button>
              <button
                className={`flex items-center rounded px-3 py-1.5 ${
                  selectedLanguage === 'vba' ? 'bg-blue-800 text-white' : 'text-blue-300'
                }`}
                onClick={() => handleLanguageChange('vba')}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                VBA
              </button>
              <button
                className={`flex items-center rounded px-3 py-1.5 ${
                  selectedLanguage === 'dax' ? 'bg-blue-800 text-white' : 'text-blue-300'
                }`}
                onClick={() => handleLanguageChange('dax')}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                DAX
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
                    Éditeur {selectedLanguage === 'python' ? 'Python' : selectedLanguage === 'sql' ? 'SQL' : selectedLanguage === 'vba' ? 'VBA' : 'DAX'}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {codeTitle ? codeTitle : "Éditer et exécuter votre code"}
                  </CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
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
              
              {/* Boutons d'exécution déplacés ici */}
              <div className="flex justify-between mt-3 pt-3 border-t border-blue-500/20">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTranslator(!showTranslator)}
                    className="border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                    disabled={isProcessing}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    IA Translator
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
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
                    size="sm"
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
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Interface de traduction IA */}
              {showTranslator && (
                <div className="border-b border-purple-500/30 bg-purple-900/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold flex items-center">
                      <Brain className="mr-2 h-4 w-4 text-purple-400" />
                      IA Translator
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-gray-400 hover:text-gray-300"
                      onClick={() => setShowTranslator(false)}
                    >
                      <span className="sr-only">Fermer</span>
                      ×
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-gray-300 text-sm mb-3 p-3 bg-purple-900/10 border border-purple-500/30 rounded-md">
                      <strong className="text-purple-300">Comment utiliser IA Translator :</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Écrivez votre demande en langage naturel dans le champ ci-dessous</li>
                        <li>Choisissez le langage cible (Python ou SQL)</li>
                        <li>Cliquez sur le bouton "Traduire" pour générer le code</li>
                      </ol>
                    </div>
                    
                    <Textarea
                      placeholder="Décrivez en langage naturel ce que vous voulez accomplir, et l'IA le traduira en code..."
                      className="bg-black/30 border-purple-500/30 text-gray-200 h-24"
                      value={naturalText}
                      onChange={(e) => setNaturalText(e.target.value)}
                    />
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1">
                        <Label htmlFor="target-language" className="text-gray-300 mb-1 block">
                          Langue cible
                        </Label>
                        <Select
                          value={targetLanguage}
                          onValueChange={(value) => setTargetLanguage(value as 'python' | 'sql' | 'vba' | 'dax')}
                        >
                          <SelectTrigger className="bg-black/30 border-purple-500/30 text-gray-200">
                            <SelectValue placeholder="Choisir la langue" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-purple-500/30">
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="sql">SQL</SelectItem>
                            <SelectItem value="vba">VBA</SelectItem>
                            <SelectItem value="dax">DAX</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex space-x-2 mt-auto">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-purple-800/50 text-purple-200 hover:bg-purple-800/70"
                          onClick={() => {
                            if (naturalText.trim()) {
                              translateToCode(naturalText, targetLanguage);
                              setShowTranslator(false);
                            }
                          }}
                          disabled={isProcessing || !naturalText.trim()}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Traduction...
                            </>
                          ) : (
                            <>
                              <Brain className="mr-2 h-4 w-4" />
                              Traduire
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTranslator(false)}
                          className="border-gray-700 text-gray-300"
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ height: editorHeight }} className="border-b border-blue-500/20">
                <Editor
                  height={editorHeight}
                  language={getEditorLanguage(selectedLanguage)}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  beforeMount={(monaco) => {
                    // Configuration personnalisée pour VBA
                    if (!monaco.languages.getLanguages().find(lang => lang.id === 'vba')) {
                      monaco.languages.register({ id: 'vba' });
                      monaco.languages.setMonarchTokensProvider('vba', {
                        tokenizer: {
                          root: [
                            [/\b(?:Sub|Function|End|If|Then|Else|ElseIf|For|Next|Do|Loop|While|Wend|Dim|As|Set|Public|Private|Static|Const|Option|Explicit|ByVal|ByRef|Exit|Return|Call|With|Select|Case|To|Step)\b/i, 'keyword'],
                            [/\b(?:String|Integer|Long|Double|Boolean|Date|Variant|Object|Worksheet|Workbook|Range|Cell|Collection)\b/i, 'type'],
                            [/'.*$/, 'comment'],
                            [/".*?"/, 'string'],
                            [/\b\d+(\.\d+)?\b/, 'number'],
                            [/[a-zA-Z_]\w*/, 'identifier'],
                          ]
                        }
                      });
                    }
                    
                    // Configuration personnalisée pour DAX
                    if (!monaco.languages.getLanguages().find(lang => lang.id === 'dax')) {
                      monaco.languages.register({ id: 'dax' });
                      monaco.languages.setMonarchTokensProvider('dax', {
                        tokenizer: {
                          root: [
                            [/\b(?:CALCULATE|SUM|COUNT|AVERAGE|MAX|MIN|DIVIDE|IF|SWITCH|BLANK|VALUES|ALL|FILTER|RELATED|DATEADD|DATEDIFF|YEAR|MONTH|DAY|TODAY|NOW|VAR|RETURN|SUMX|COUNTX|AVERAGEX|MAXX|MINX|RANKX|TOPN|CONCATENATE|LEFT|RIGHT|MID|LEN|FIND|SUBSTITUTE|UPPER|LOWER|TRIM|FORMAT|VALUE|DATEVALUE|TIMEVALUE|WEEKDAY|WEEKNUM|EOMONTH|EDATE|NETWORKDAYS|WORKDAY|HOUR|MINUTE|SECOND|TIME|DATE|DATETIME|CURRENCY|PERCENT|DECIMAL|INTEGER|BOOLEAN|TEXT|TRUE|FALSE|EARLIER|EARLIEST|HASONEVALUE|HASONEFILTER|ISCROSSFILTERED|ISFILTERED|SELECTEDVALUE|ALLEXCEPT|ALLSELECTED|KEEPFILTERS|REMOVEFILTERS|CROSSFILTER|USERELATIONSHIP|TREATAS|GENERATE|GENERATEALL|ADDCOLUMNS|SELECTCOLUMNS|SUMMARIZE|GROUPBY|CURRENTGROUP|ROLLUP|ROLLUPGROUP|ROLLUPADDISSUBTOTAL|DISTINCT|UNION|INTERSECT|EXCEPT|NATURALINNERJOIN|NATURALLEFTOUTERJOIN|CROSSJOIN|DATATABLE|ROW|CALENDAR|CALENDARAUTO|PARALLELPERIOD|DATESINPERIOD|DATESBETWEEN|DATESQTD|DATESYTD|DATESMTD|FIRSTDATE|LASTDATE|FIRSTNONBLANK|LASTNONBLANK|STARTOFMONTH|ENDOFMONTH|STARTOFQUARTER|ENDOFQUARTER|STARTOFYEAR|ENDOFYEAR|SAMEPERIODLASTYEAR|PREVIOUSDAY|PREVIOUSMONTH|PREVIOUSQUARTER|PREVIOUSYEAR|NEXTDAY|NEXTMONTH|NEXTQUARTER|NEXTYEAR|TOTALMTD|TOTALQTD|TOTALYTD|OPENINGBALANCEMONTH|OPENINGBALANCEQUARTER|OPENINGBALANCEYEAR|CLOSINGBALANCEMONTH|CLOSINGBALANCEQUARTER|CLOSINGBALANCEYEAR)\b/i, 'keyword'],
                            [/\/\/.*$/, 'comment'],
                            [/\/\*[\s\S]*?\*\//, 'comment'],
                            [/".*?"/, 'string'],
                            [/'.*?'/, 'string'],
                            [/\[[^\]]+\]/, 'variable'],
                            [/\b\d+(\.\d+)?\b/, 'number'],
                            [/[a-zA-Z_]\w*/, 'identifier'],
                          ]
                        }
                      });
                    }
                  }}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    autoIndent: 'full',
                    formatOnPaste: true,
                    formatOnType: true,
                    tabSize: selectedLanguage === 'python' ? 4 : 2,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    suggest: {
                      showKeywords: true,
                      showSnippets: true,
                    },
                    quickSuggestions: {
                      other: true,
                      comments: false,
                      strings: false
                    }
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
                  ) : selectedLanguage === 'sql' && result.includes('|') ? (
                    <div className="text-gray-300 font-mono text-sm bg-black/30 p-3 rounded-md max-h-56 overflow-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          {result.split('\n').filter(line => line.trim()).slice(0, 1).map((line) => {
                            const cells = line.split('|').filter(cell => cell.trim() !== '');
                            return (
                              <tr 
                                key="header" 
                                className="bg-blue-900/30 border-b border-blue-500/40"
                              >
                                {cells.map((cell, cellIndex) => (
                                  <th 
                                    key={cellIndex} 
                                    className="px-3 py-2 font-semibold text-blue-300 border-r border-blue-500/40 last:border-r-0 text-left"
                                  >
                                    {cell.trim()}
                                  </th>
                                ))}
                              </tr>
                            );
                          })}
                        </thead>
                        <tbody>
                          {result.split('\n').filter(line => line.trim()).slice(1).map((line, index) => {
                            const cells = line.split('|').filter(cell => cell.trim() !== '');
                            return (
                              <tr 
                                key={index} 
                                className="border-b border-gray-800"
                              >
                                {cells.map((cell, cellIndex) => (
                                  <td 
                                    key={cellIndex} 
                                    className="px-3 py-2 border-r border-gray-800 last:border-r-0"
                                  >
                                    {cell.trim()}
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm bg-black/30 p-3 rounded-md max-h-56 overflow-auto">
                      {result}
                    </pre>
                  )}
                </div>
              )}
              
              {/* Variables de session stockées */}
              {sessionVariables && !isProcessing && (
                <div className="p-4 bg-gradient-to-r from-gray-900/80 to-purple-900/30 border-t border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold flex items-center">
                      <Database className="mr-2 h-4 w-4 text-purple-400" />
                      Variables de session
                    </h3>
                    <Badge variant="outline" className="bg-purple-900/40 text-purple-300 border-purple-500/30">
                      Persistantes
                    </Badge>
                  </div>
                  
                  <div className="text-gray-300 text-sm bg-black/30 p-3 rounded-md">
                    {sessionVariables}
                  </div>
                  
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="outline" 
                      size="sm"
                      className="text-xs h-7 border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                      onClick={resetSessionVariables}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Réinitialiser les variables
                    </Button>
                  </div>
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
            
            <CardFooter className="border-t border-blue-500/20 py-3 flex justify-end">
              <div className="text-gray-400 text-sm italic">
                Utilisez les boutons en haut de l'éditeur pour exécuter votre code ou demander de l'aide à l'IA
              </div>
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
                  <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-800/40 rounded-md px-4">
                    <Trophy className="h-4 w-4 mr-2" />
                    Défis IA
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="data-[state=active]:bg-green-800/40 rounded-md px-4">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Ressources
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="examples" className="flex-grow overflow-auto p-4">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-cyan-400" />
                    Exemples de code {selectedLanguage === 'python' ? 'Python' : selectedLanguage === 'sql' ? 'SQL' : selectedLanguage === 'vba' ? 'VBA' : 'DAX'}
                  </h3>
                  
                  <div className="space-y-3">
                    {(() => {
                      switch(selectedLanguage) {
                        case 'python': return pythonExamples;
                        case 'sql': return sqlExamples;
                        case 'vba': return vbaExamples;
                        case 'dax': return daxExamples;
                        default: return pythonExamples;
                      }
                    })().map((example, idx) => (
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
                          
                          {/* Afficher les variables de session si présentes */}
                          {item.sessionVariables && (
                            <div className="mt-2 text-xs">
                              <Badge className="bg-purple-900/30 text-purple-300 text-xs">
                                <Database className="h-3 w-3 mr-1" />
                                Session
                              </Badge>
                              <span className="text-gray-400 ml-2">
                                {item.sessionVariables}
                              </span>
                            </div>
                          )}
                          
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
              
              {/* Contenu pour l'onglet Défis IA */}
              <TabsContent value="challenges" className="flex-grow overflow-auto p-4">
                <ChallengeMode 
                  language={selectedLanguage}
                  editorValue={code}
                  setEditorValue={setCode}
                  executeCode={executeCode}
                  executionResult={result}
                  isProcessing={isProcessing}
                />
              </TabsContent>
              
              {/* Contenu pour l'onglet Ressources */}
              <TabsContent value="resources" className="flex-grow overflow-auto p-4">
                <div className="space-y-5">
                  <h3 className="text-white font-semibold flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-green-400" />
                    Ressources {selectedLanguage === 'python' ? 'Python' : 'SQL'}
                  </h3>
                  
                  {selectedLanguage === 'python' ? (
                    <>
                      {/* Ressources Python */}
                      <div className="border border-green-500/30 bg-green-900/10 rounded-md p-4">
                        <h4 className="text-green-300 font-medium text-lg mb-2">Bonnes pratiques Python</h4>
                        <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                          <li>Suivez la <span className="text-blue-300">PEP 8</span> pour le style de code (indentation de 4 espaces, noms de variables en snake_case)</li>
                          <li>Utilisez des noms de variables explicites (préférez <code className="bg-black/30 px-1 rounded">temperature_celsius</code> à <code className="bg-black/30 px-1 rounded">t</code>)</li>
                          <li>Commentez votre code pour expliquer le "pourquoi" et non le "comment"</li>
                          <li>Utilisez des fonctions pour éviter la répétition de code</li>
                          <li>Gérez les exceptions avec des blocs try/except appropriés</li>
                          <li>Utilisez des tests unitaires pour valider votre code</li>
                        </ul>
                      </div>
                      
                      <div className="border border-blue-500/30 bg-blue-900/10 rounded-md p-4">
                        <h4 className="text-blue-300 font-medium text-lg mb-2">Bibliothèques Python essentielles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">NumPy</h5>
                            <p className="text-sm text-gray-300 mt-1">Calcul scientifique, manipulation de tableaux multidimensionnels</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">import numpy as np</code>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Pandas</h5>
                            <p className="text-sm text-gray-300 mt-1">Analyse et manipulation de données tabulaires</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">import pandas as pd</code>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Matplotlib</h5>
                            <p className="text-sm text-gray-300 mt-1">Création de graphiques et visualisations</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">import matplotlib.pyplot as plt</code>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Scikit-learn</h5>
                            <p className="text-sm text-gray-300 mt-1">Apprentissage automatique et modèles prédictifs</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">from sklearn import ...</code>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-purple-500/30 bg-purple-900/10 rounded-md p-4">
                        <h4 className="text-purple-300 font-medium text-lg mb-2">Astuces pour déboguer</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">print()</span>
                            <span>Utilisez des instructions print() pour afficher l'état des variables</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">type()</span>
                            <span>Vérifiez le type d'une variable avec type(variable)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">dir()</span>
                            <span>Explorez les attributs d'un objet avec dir(object)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">help()</span>
                            <span>Obtenez de l'aide sur une fonction avec help(function)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">pdb</span>
                            <span>Pour le débogage avancé: import pdb; pdb.set_trace()</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border border-cyan-500/30 bg-cyan-900/10 rounded-md p-4">
                        <h4 className="text-cyan-300 font-medium text-lg mb-2">Ressources d'apprentissage</h4>
                        <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                          <li>Documentation officielle Python: <span className="text-cyan-300">python.org/doc</span></li>
                          <li>Real Python: tutoriels et articles détaillés</li>
                          <li>Python Data Science Handbook par Jake VanderPlas</li>
                          <li>Automate the Boring Stuff with Python par Al Sweigart</li>
                          <li>Cours en ligne: Coursera, Udemy, DataCamp</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Ressources SQL */}
                      <div className="border border-green-500/30 bg-green-900/10 rounded-md p-4">
                        <h4 className="text-green-300 font-medium text-lg mb-2">Bonnes pratiques SQL</h4>
                        <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                          <li>Utilisez des noms de tables et colonnes explicites et cohérents</li>
                          <li>Préférez les jointures explicites (JOIN) aux jointures implicites</li>
                          <li>Utilisez les index pour optimiser les performances des requêtes</li>
                          <li>Limitez les résultats avec WHERE avant de faire des opérations coûteuses</li>
                          <li>Évitez SELECT * et spécifiez les colonnes dont vous avez besoin</li>
                          <li>Utilisez des commentaires pour documenter les requêtes complexes</li>
                        </ul>
                      </div>
                      
                      <div className="border border-blue-500/30 bg-blue-900/10 rounded-md p-4">
                        <h4 className="text-blue-300 font-medium text-lg mb-2">Fonctions SQL essentielles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Agrégation</h5>
                            <p className="text-sm text-gray-300 mt-1">Fonctions pour calculer des statistiques sur des groupes</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">COUNT(), SUM(), AVG(), MIN(), MAX()</code>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Manipulation de chaînes</h5>
                            <p className="text-sm text-gray-300 mt-1">Fonctions pour traiter les données textuelles</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">CONCAT(), SUBSTRING(), LOWER(), UPPER()</code>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Dates et heures</h5>
                            <p className="text-sm text-gray-300 mt-1">Fonctions pour manipuler les dates</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">DATE_FORMAT(), DATEDIFF(), NOW()</code>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-blue-300">Fenêtrage (Window)</h5>
                            <p className="text-sm text-gray-300 mt-1">Analyses avancées sur des ensembles de lignes</p>
                            <code className="text-xs bg-black/30 block p-2 mt-2 rounded">OVER(), PARTITION BY, RANK()</code>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-purple-500/30 bg-purple-900/10 rounded-md p-4">
                        <h4 className="text-purple-300 font-medium text-lg mb-2">Types de requêtes avancées</h4>
                        <ul className="space-y-2 text-gray-300 text-sm">
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">CTE</span>
                            <span>Common Table Expressions pour des requêtes plus lisibles (WITH clause)</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">PIVOT</span>
                            <span>Transformez des lignes en colonnes pour des vues tabulaires</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">CASE</span>
                            <span>Expression conditionnelle pour logique complexe dans les requêtes</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">EXPLAIN</span>
                            <span>Analysez comment la base de données exécute votre requête</span>
                          </li>
                          <li className="flex items-start">
                            <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded mr-2 font-mono text-xs mt-0.5">TRIGGER</span>
                            <span>Exécutez automatiquement des actions sur des événements</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border border-cyan-500/30 bg-cyan-900/10 rounded-md p-4">
                        <h4 className="text-cyan-300 font-medium text-lg mb-2">Outils SQL populaires</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-cyan-300">MySQL</h5>
                            <p className="text-sm text-gray-300 mt-1">Le SGBD open-source le plus populaire</p>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-cyan-300">PostgreSQL</h5>
                            <p className="text-sm text-gray-300 mt-1">SGBD avancé avec fonctionnalités étendues</p>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-cyan-300">SQLite</h5>
                            <p className="text-sm text-gray-300 mt-1">Base de données légère pour applications simples</p>
                          </div>
                          <div className="bg-black/20 p-3 rounded-md">
                            <h5 className="font-medium text-cyan-300">ORM</h5>
                            <p className="text-sm text-gray-300 mt-1">SQLAlchemy, Django ORM, Sequelize</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-amber-500/30 bg-amber-900/10 rounded-md p-4">
                        <h4 className="text-amber-300 font-medium text-lg mb-2">Ressources d'apprentissage</h4>
                        <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
                          <li>Mode Analytics SQL Tutorial</li>
                          <li>W3Schools SQL Tutorial</li>
                          <li>SQLZoo: Exercices interactifs SQL</li>
                          <li>Documentation officielle de MySQL et PostgreSQL</li>
                          <li>DataCamp: SQL Fundamentals</li>
                        </ul>
                      </div>
                    </>
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