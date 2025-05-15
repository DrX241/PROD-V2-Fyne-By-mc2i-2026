import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, CheckCircle, Copy, RefreshCw, Rocket, Brain, Image, Code, MessageSquare, Search, Wand, Robot } from 'lucide-react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/use-theme';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  category: 'vision' | 'text' | 'code' | 'ml';
}

interface GeneratedResponse {
  content: string;
  timestamp: Date;
  model: string;
  promptType: string;
}

const AI_PLAYGROUND: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const highContrastMode = theme === 'high-contrast';
  const [activeTab, setActiveTab] = useState('text-generation');
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState<PromptTemplate | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCopied, setShowCopied] = useState(false);

  // Exemples de templates de prompts
  const promptTemplates: PromptTemplate[] = [
    {
      id: 'text-summarize',
      title: 'Résumé de texte',
      description: 'Créer un résumé concis d\'un texte plus long',
      template: 'Résume le texte suivant en 3-5 points clés:\n\n[Votre texte ici]',
      category: 'text'
    },
    {
      id: 'text-explain',
      title: 'Explication de concept',
      description: 'Explication détaillée d\'un concept technique',
      template: 'Explique le concept de [concept] comme si j\'avais 12 ans. Utilise des analogies simples.',
      category: 'text'
    },
    {
      id: 'ml-regression',
      title: 'Régression linéaire',
      description: 'Générer un script Python pour la régression linéaire',
      template: 'Écris un script Python utilisant scikit-learn pour effectuer une régression linéaire sur un jeu de données. Inclus le chargement des données, la division train/test, l\'entraînement, l\'évaluation et la visualisation des résultats.',
      category: 'ml'
    },
    {
      id: 'ml-classification',
      title: 'Classification',
      description: 'Générer un script pour la classification',
      template: 'Écris un script Python pour classifier [type de données] en utilisant [algorithme]. Explique chaque étape du code.',
      category: 'ml'
    },
    {
      id: 'code-debug',
      title: 'Débogage de code',
      description: 'Aide à trouver et corriger des bugs',
      template: 'Voici un code Python qui contient des erreurs:\n\n```python\n[Votre code ici]\n```\n\nIdentifie et corrige tous les bugs.',
      category: 'code'
    },
    {
      id: 'code-optimize',
      title: 'Optimisation',
      description: 'Optimiser un code existant',
      template: 'Optimise ce code Python pour améliorer ses performances:\n\n```python\n[Votre code ici]\n```',
      category: 'code'
    },
    {
      id: 'vision-describe',
      title: 'Description d\'image',
      description: 'Description détaillée d\'une image',
      template: '[Insérez une image] Décris en détail ce que tu vois sur cette image, en particulier [aspect spécifique].',
      category: 'vision'
    },
    {
      id: 'vision-analyze',
      title: 'Analyse de graphique',
      description: 'Extraire des insights d\'un graphique',
      template: '[Insérez une image de graphique/tableau] Analyse ce graphique et explique les principales tendances et conclusions.',
      category: 'vision'
    }
  ];

  // Filtrer les templates selon l'onglet actif
  const getFilteredTemplates = () => {
    switch (activeTab) {
      case 'text-generation':
        return promptTemplates.filter(t => t.category === 'text');
      case 'code-generation':
        return promptTemplates.filter(t => t.category === 'code');
      case 'ml-models':
        return promptTemplates.filter(t => t.category === 'ml');
      case 'vision-analysis':
        return promptTemplates.filter(t => t.category === 'vision');
      default:
        return promptTemplates;
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedPromptTemplate(template);
    setPromptText(template.template);
  };

  const handleCopyToClipboard = () => {
    if (generatedResponses.length > 0) {
      navigator.clipboard.writeText(generatedResponses[0].content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      toast({
        title: "Champ vide",
        description: "Veuillez entrer un prompt avant de générer une réponse.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Nous simulons l'appel API ici pour le moment
      // Dans une implémentation réelle, nous appellerions l'API
      setTimeout(() => {
        const promptType = selectedPromptTemplate?.title || activeTab;
        
        // Générer une réponse fictive basée sur le type de prompt
        let generatedContent = '';
        
        if (activeTab === 'code-generation') {
          generatedContent = `\`\`\`python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# Charger les données
data = pd.read_csv('dataset.csv')
X = data.drop('target', axis=1)
y = data['target']

# Diviser en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Normaliser les données
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Entraîner le modèle
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Évaluer le modèle
y_pred = model.predict(X_test)
print(confusion_matrix(y_test, y_pred))
print(classification_report(y_test, y_pred))
\`\`\`

Ce code implémente une classification binaire avec régression logistique. Voici une explication étape par étape:

1. Importation des bibliothèques nécessaires
2. Chargement et préparation des données
3. Division en ensembles d'entraînement et de test (80/20)
4. Normalisation des données
5. Entraînement du modèle de régression logistique
6. Évaluation du modèle en utilisant la matrice de confusion et le rapport de classification`;
        } else if (activeTab === 'ml-models') {
          generatedContent = `# Analyse exploratoire et préparation d'un modèle de Machine Learning

## 1. Exploration des données

Commençons par explorer le jeu de données:

\`\`\`python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Charger les données
df = pd.read_csv('data.csv')

# Afficher les premières lignes
print(df.head())

# Statistiques descriptives
print(df.describe())

# Vérifier les valeurs manquantes
print(df.isnull().sum())

# Visualiser la distribution des variables
plt.figure(figsize=(12, 8))
for i, col in enumerate(df.select_dtypes(include=['float64', 'int64']).columns[:6]):
    plt.subplot(2, 3, i+1)
    sns.histplot(df[col], kde=True)
    plt.title(f'Distribution de {col}')
plt.tight_layout()
plt.show()

# Matrice de corrélation
plt.figure(figsize=(10, 8))
corr_matrix = df.corr()
sns.heatmap(corr_matrix, annot=True, cmap='coolwarm')
plt.title('Matrice de corrélation')
plt.show()
\`\`\`

## 2. Prétraitement des données

\`\`\`python
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Identifier les colonnes numériques et catégorielles
numerical_cols = df.select_dtypes(include=['int64', 'float64']).columns
categorical_cols = df.select_dtypes(include=['object', 'category']).columns

# Définir les préprocesseurs
numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combiner les préprocesseurs
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_cols),
        ('cat', categorical_transformer, categorical_cols)
    ])
\`\`\`

## 3. Entraînement d'un modèle

\`\`\`python
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# Définir X et y
X = df.drop('target', axis=1)
y = df['target']

# Diviser en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Créer un pipeline complet
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=42))
])

# Paramètres pour la recherche sur grille
param_grid = {
    'classifier__n_estimators': [100, 200],
    'classifier__max_depth': [None, 10, 20],
    'classifier__min_samples_split': [2, 5]
}

# Recherche sur grille avec validation croisée
grid_search = GridSearchCV(model, param_grid, cv=5, scoring='accuracy')
grid_search.fit(X_train, y_train)

# Meilleurs paramètres
print("Meilleurs paramètres:", grid_search.best_params_)

# Évaluer le modèle
y_pred = grid_search.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred))
\`\`\`

Cette approche complète permet d'explorer les données, les prétraiter correctement et d'entraîner un modèle optimisé avec validation croisée.`;
        } else if (activeTab === 'vision-analysis') {
          generatedContent = `# Analyse d'image

L'image montre un graphique de série temporelle représentant probablement l'évolution d'un indicateur financier ou de performance sur une période de 12 mois.

## Observations principales:

1. **Tendance globale**: On observe une tendance à la hausse sur l'ensemble de la période, avec une progression d'environ 25% entre le point de départ et le point final.

2. **Points critiques**:
   - Un pic important au mois d'avril (augmentation de 15% par rapport à mars)
   - Une baisse significative en juillet (chute de 10%)
   - Une période de stabilisation entre août et octobre
   - Une forte reprise à la hausse à partir de novembre

3. **Saisonnalité**: Il semble y avoir un motif trimestriel avec des hausses plus importantes à la fin de chaque trimestre (mars, juin, septembre, décembre).

4. **Volatilité**: La première moitié de l'année montre une volatilité plus importante que la seconde moitié.

## Recommandations d'analyse supplémentaire:

1. Comparer cette tendance avec les données des années précédentes pour identifier d'éventuels schémas saisonniers récurrents.

2. Effectuer une analyse de décomposition temporelle pour isoler les composantes de tendance, saisonnalité et résidus.

3. Examiner les corrélations potentielles avec d'autres métriques ou événements externes qui pourraient expliquer les fluctuations observées.

4. Utiliser des modèles prédictifs (ARIMA, Prophet, etc.) pour prévoir l'évolution future de cette métrique.`;
        } else {
          generatedContent = `# Introduction à l'intelligence artificielle générative

L'IA générative représente une avancée majeure dans le domaine de l'intelligence artificielle. Contrairement aux systèmes d'IA traditionnels qui analysent et classifient des données existantes, les modèles génératifs peuvent créer de nouveaux contenus originaux - textes, images, musique, code, etc.

## Principes fondamentaux

Les modèles d'IA générative reposent principalement sur des architectures de réseaux de neurones profonds, notamment:

1. **Transformers**: Architecture dominante pour le traitement du langage naturel, utilisée dans des modèles comme GPT (Generative Pre-trained Transformer), LLaMA, etc.

2. **Diffusion**: Méthode puissante pour la génération d'images, où un processus progressif transforme du bruit en images cohérentes (Stable Diffusion, DALL-E).

3. **VAE (Variational Autoencoders)** et **GAN (Generative Adversarial Networks)**: Architectures pionnières qui ont ouvert la voie à la génération de contenu.

## Applications pratiques

L'IA générative trouve des applications dans de nombreux domaines:

- **Création de contenu**: Rédaction assistée, génération d'articles, traduction, résumés
- **Programmation**: Génération et débogage de code, complétion automatique
- **Design et créativité**: Création d'images, conception assistée, édition photo/vidéo
- **Science des données**: Génération de données synthétiques, augmentation de jeux de données
- **Médecine**: Création d'images médicales synthétiques pour l'entraînement des modèles diagnostiques

## Défis et considérations éthiques

Malgré leur potentiel, ces technologies soulèvent des questions importantes:

- **Biais et équité**: Les modèles peuvent perpétuer ou amplifier les biais présents dans leurs données d'entraînement
- **Désinformation**: Possibilité de créer du contenu trompeur à grande échelle (deepfakes)
- **Droits d'auteur**: Questions sur la propriété intellectuelle du contenu généré
- **Impact socio-économique**: Automatisation potentielle de certaines tâches créatives

## Techniques d'ingénierie des prompts

Pour obtenir des résultats optimaux avec ces modèles, quelques techniques efficaces:

1. **Spécificité**: Formuler des requêtes précises plutôt que vagues
2. **Contextualisation**: Fournir suffisamment de contexte pour guider la génération
3. **Itération**: Affiner progressivement les prompts en fonction des résultats
4. **Structure**: Demander explicitement le format ou la structure souhaités
5. **Personnalisation**: Adapter le style, le ton et le niveau technique à vos besoins

En maîtrisant ces principes, vous pourrez exploiter pleinement le potentiel de l'IA générative dans vos projets de data science.`;
        }

        const newResponse: GeneratedResponse = {
          content: generatedContent,
          timestamp: new Date(),
          model: selectedModel,
          promptType: promptType
        };

        setGeneratedResponses([newResponse, ...generatedResponses]);
        
        // Augmenter le score de l'utilisateur
        setUserScore(prev => prev + 10);
        setStreak(prev => prev + 1);
        
        toast({
          title: "Génération réussie",
          description: "Votre prompt a été traité avec succès.",
        });
        
        setIsGenerating(false);
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération. Veuillez réessayer.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className={`min-h-screen ${highContrastMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-900 to-blue-950'}`}>
      <header className="py-6 border-b border-blue-700/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/data-ia')}
                className="text-white hover:text-blue-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-white ml-4 font-data-title flex items-center">
                <Brain className="mr-2 h-6 w-6 text-cyan-400" />
                AI PLAYGROUND
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="high-contrast-mode" className="text-gray-400 text-sm">Mode contraste</Label>
                <Switch
                  id="high-contrast-mode"
                  checked={theme === 'high-contrast'}
                  onCheckedChange={(checked) => 
                    checked ? useTheme().setTheme('high-contrast') : useTheme().setTheme('futuristic')
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Barre latérale */}
            <div className="xl:col-span-3 space-y-6">
              {/* Carte de profil */}
              <Card className="bg-[#121a2c]/60 border-blue-800/40 text-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                        <RiRobot2Line className="text-white text-xl" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">AI Explorer</CardTitle>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-900/30 text-cyan-300 border-cyan-500/50 whitespace-nowrap">
                      Niveau 1
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progression</span>
                        <span className="text-cyan-300">{userScore} / 100 XP</span>
                      </div>
                      <Progress value={userScore} className="h-2 bg-blue-950" indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-[#1a233a] rounded-md p-2">
                        <div className="font-bold text-cyan-300 text-lg">{generatedResponses.length}</div>
                        <div className="text-xs text-gray-400">Génération(s)</div>
                      </div>
                      <div className="bg-[#1a233a] rounded-md p-2">
                        <div className="font-bold text-cyan-300 text-lg">{streak}</div>
                        <div className="text-xs text-gray-400">Série</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sélection de modèle */}
              <Card className="bg-[#121a2c]/60 border-blue-800/40 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Modèle IA</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger className="bg-[#1a233a] border-blue-800/40 text-white">
                      <SelectValue placeholder="Sélectionner un modèle" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a233a] border-blue-800/40 text-white">
                      <SelectItem value="gpt-4o-mini">Azure OpenAI GPT-4o-mini</SelectItem>
                      <SelectItem value="gpt-4o">Azure OpenAI GPT-4o</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-gray-400">
                    Le modèle sélectionné détermine les capacités et la qualité des réponses générées.
                  </p>
                </CardContent>
              </Card>

              {/* Templates de prompts */}
              <Card className="bg-[#121a2c]/60 border-blue-800/40 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">Templates de prompts</CardTitle>
                  <CardDescription className="text-gray-400">
                    Sélectionnez un template pour commencer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getFilteredTemplates().map(template => (
                      <div 
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className={`p-3 rounded-md cursor-pointer transition-colors
                          ${selectedPromptTemplate?.id === template.id 
                            ? 'bg-blue-600/20 border border-blue-500/50' 
                            : 'bg-[#1a233a] hover:bg-[#202a45] border border-transparent'
                          }`}
                      >
                        <div className="font-medium">{template.title}</div>
                        <div className="text-xs text-gray-400">{template.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Zone principale */}
            <div className="xl:col-span-9 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="bg-[#1a233a] p-1">
                    <TabsTrigger value="text-generation" className="data-[state=active]:bg-blue-600">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Texte
                    </TabsTrigger>
                    <TabsTrigger value="code-generation" className="data-[state=active]:bg-blue-600">
                      <Code className="mr-2 h-4 w-4" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="ml-models" className="data-[state=active]:bg-blue-600">
                      <Brain className="mr-2 h-4 w-4" />
                      ML
                    </TabsTrigger>
                    <TabsTrigger value="vision-analysis" className="data-[state=active]:bg-blue-600">
                      <Image className="mr-2 h-4 w-4" />
                      Vision
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Zone de prompt commune à tous les onglets */}
                <Card className="bg-[#121a2c]/60 border-blue-800/40 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {activeTab === 'text-generation' && "Génération de texte"}
                      {activeTab === 'code-generation' && "Génération de code"}
                      {activeTab === 'ml-models' && "Modèles de Machine Learning"}
                      {activeTab === 'vision-analysis' && "Analyse d'images"}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {activeTab === 'text-generation' && "Générez des contenus textuels éducatifs et explicatifs sur des sujets Data & IA"}
                      {activeTab === 'code-generation' && "Générez du code Python pour des tâches de Data Science et Machine Learning"}
                      {activeTab === 'ml-models' && "Expérimentez avec différents modèles d'apprentissage automatique"}
                      {activeTab === 'vision-analysis' && "Analysez des images et graphiques de données"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prompt" className="text-gray-300">Votre prompt</Label>
                        <Textarea 
                          id="prompt"
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          placeholder="Décrivez ce que vous souhaitez générer..."
                          className="min-h-[150px] bg-[#1a233a] border-blue-800/40 text-white placeholder:text-gray-500"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={handleGenerate}
                          disabled={isGenerating || !promptText.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isGenerating ? (
                            <>
                              <IoRefresh className="mr-2 animate-spin" />
                              Génération en cours...
                            </>
                          ) : (
                            <>
                              <IoRocket className="mr-2" />
                              Générer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Résultats de génération */}
                {generatedResponses.length > 0 && (
                  <Card className="bg-[#121a2c]/60 border-blue-800/40 text-white">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Résultat</CardTitle>
                        <CardDescription className="text-gray-400">
                          Généré avec {generatedResponses[0].model} • {generatedResponses[0].promptType}
                        </CardDescription>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={handleCopyToClipboard}
                              className="text-gray-400 hover:text-white hover:bg-blue-800/30"
                            >
                              {showCopied ? <IoCheckmarkCircle className="text-green-500" /> : <IoCopy />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copier dans le presse-papier</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md bg-[#1a233a] p-4 text-gray-200">
                        {activeTab === 'code-generation' ? (
                          <div className="markdown-content" dangerouslySetInnerHTML={{ 
                            __html: generatedResponses[0].content
                              .replace(/```python([\s\S]*?)```/g, (match, code) => {
                                return `<div style="margin: 16px 0;"><pre style="margin: 0;"><code class="language-python">${code.trim()}</code></pre></div>`;
                              })
                              .replace(/```([\s\S]*?)```/g, (match, code) => {
                                return `<div style="margin: 16px 0;"><pre style="margin: 0;"><code>${code.trim()}</code></pre></div>`;
                              })
                              .replace(/\n\n/g, '<br><br>')
                          }} />
                        ) : activeTab === 'ml-models' ? (
                          <div className="markdown-content" dangerouslySetInnerHTML={{ 
                            __html: generatedResponses[0].content
                              .replace(/```python([\s\S]*?)```/g, (match, code) => {
                                return `<div style="margin: 16px 0;"><pre style="margin: 0;"><code class="language-python">${code.trim()}</code></pre></div>`;
                              })
                              .replace(/```([\s\S]*?)```/g, (match, code) => {
                                return `<div style="margin: 16px 0;"><pre style="margin: 0;"><code>${code.trim()}</code></pre></div>`;
                              })
                              .replace(/\n\n/g, '<br><br>')
                              .replace(/^# (.*?)$/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; margin: 16px 0 8px 0;">$1</h1>')
                              .replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.25rem; font-weight: bold; margin: 16px 0 8px 0;">$1</h2>')
                          }} />
                        ) : (
                          <div className="markdown-content" dangerouslySetInnerHTML={{ 
                            __html: generatedResponses[0].content
                              .replace(/^# (.*?)$/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; margin: 16px 0 8px 0;">$1</h1>')
                              .replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.25rem; font-weight: bold; margin: 16px 0 8px 0;">$1</h2>')
                              .replace(/^- (.*?)$/gm, '<li style="margin-left: 16px;">$1</li>')
                              .replace(/\n\n/g, '<br><br>')
                          }} />
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Alert className="bg-blue-900/30 border-blue-500/30">
                        <LuWand2 className="h-4 w-4" />
                        <AlertTitle>Conseil</AlertTitle>
                        <AlertDescription>
                          Pour améliorer vos résultats, essayez d'être plus spécifique dans vos prompts et d'inclure des exemples concrets.
                        </AlertDescription>
                      </Alert>
                    </CardFooter>
                  </Card>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default AI_PLAYGROUND;