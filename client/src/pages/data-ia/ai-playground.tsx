import React, { useState } from 'react';
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
import { ArrowLeft, CheckCircle, Copy, RefreshCw, Rocket, Brain, Image, Code, MessageSquare, Search, Wand, Bot, Trophy, Star, Zap, BookOpen, Lightbulb } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/ThemeContext';

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

interface Challenge {
  id: number;
  title: string;
  description: string;
  promptCategory: 'vision' | 'text' | 'code' | 'ml';
  promptTemplate: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  expectedConcepts: string[];
  explanation: string;
  icon: React.ReactNode;
}

const AIPlayground: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { themeMode, setThemeMode } = useTheme();
  const highContrastMode = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState('text-generation');
  const [promptText, setPromptText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [generatedResponses, setGeneratedResponses] = useState<GeneratedResponse[]>([]);
  const [selectedPromptTemplate, setSelectedPromptTemplate] = useState<PromptTemplate | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCopied, setShowCopied] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);

  // Challenges d'apprentissage interactifs
  const learningChallenges: Challenge[] = [
    {
      id: 1,
      title: "Introduction à l'IA conversationnelle",
      description: "Apprenez à construire un prompt efficace pour obtenir une réponse précise et structurée sur un sujet technique.",
      promptCategory: 'text',
      promptTemplate: "Explique-moi le concept de [CONCEPT] en termes simples, comme si tu parlais à un débutant. Organise ta réponse avec des puces pour les points clés et donne un exemple concret.",
      difficulty: 'débutant',
      expectedConcepts: ["Structure de prompt", "Clarté des instructions", "Ciblage d'audience"],
      explanation: "Ce prompt est efficace car il définit clairement (1) le sujet à expliquer, (2) le niveau de complexité souhaité, (3) la structure de réponse attendue et (4) la demande d'exemples concrets. Ces éléments permettent d'obtenir une réponse plus utile et mieux adaptée à vos besoins.",
      icon: <MessageSquare className="h-5 w-5 text-blue-400" />
    },
    {
      id: 2,
      title: "Analyse de code Python",
      description: "Découvrez comment demander à l'IA d'analyser, d'expliquer et d'améliorer du code.",
      promptCategory: 'code',
      promptTemplate: "Analyse ce code Python et aide-moi à l'améliorer :\n\n```python\n[CODE]\n```\n\n1. Explique ce que fait ce code\n2. Identifie les problèmes potentiels ou inefficacités\n3. Propose une version améliorée\n4. Explique les avantages de ta solution",
      difficulty: 'intermédiaire',
      expectedConcepts: ["Revue de code", "Optimisation", "Bonnes pratiques"],
      explanation: "Cette approche structurée permet à l'IA de fournir une analyse complète: compréhension du code, diagnostic des problèmes, solution optimisée et justification. Pour des résultats optimaux avec l'analyse de code, toujours inclure le langage de programmation et demander une explication détaillée des changements proposés.",
      icon: <Code className="h-5 w-5 text-violet-400" />
    },
    {
      id: 3,
      title: "Modèles de Machine Learning",
      description: "Apprenez à demander des explications sur des concepts avancés de ML avec des exemples concrets.",
      promptCategory: 'ml',
      promptTemplate: "Explique-moi en détail le modèle de machine learning [MODÈLE]. Je veux comprendre:\n- Son principe de fonctionnement\n- Ses avantages et limitations\n- Ses cas d'usage typiques\n- Un exemple de code simple pour l'implémenter en Python\n- Comment évaluer ses performances",
      difficulty: 'avancé',
      expectedConcepts: ["Modèles de ML", "Évaluation de modèles", "Implémentation pratique"],
      explanation: "Ce prompt permet d'obtenir une explication complète d'un modèle de ML spécifique, avec à la fois la théorie et la pratique. La structure en points précis guide l'IA pour couvrir tous les aspects importants, y compris l'implémentation concrète qui aide à passer de la théorie à la pratique.",
      icon: <Brain className="h-5 w-5 text-pink-400" />
    },
    {
      id: 4,
      title: "Génération créative avec l'IA",
      description: "Découvrez comment utiliser l'IA pour générer des idées créatives et du contenu original.",
      promptCategory: 'text',
      promptTemplate: "Aide-moi à développer [NOMBRE] idées créatives pour [PROJET/APPLICATION]. Pour chaque idée:\n1. Donne-lui un nom accrocheur\n2. Décris le concept en 2-3 phrases\n3. Explique sa valeur ajoutée/innovation\n4. Suggère une approche pour l'implémenter\n\nAssure-toi que les idées soient variées et couvrent différents aspects.",
      difficulty: 'intermédiaire',
      expectedConcepts: ["Brainstorming assisté", "Innovation", "Développement conceptuel"],
      explanation: "Ce prompt est particulièrement efficace pour la génération d'idées car il combine (1) une demande claire de créativité, (2) un format structuré pour chaque idée, (3) une exigence de variété, et (4) une orientation pratique avec les suggestions d'implémentation. Cette structure permet d'obtenir des idées à la fois créatives et actionables.",
      icon: <Lightbulb className="h-5 w-5 text-yellow-400" />
    },
    {
      id: 5,
      title: "Analyse de données et visualisation",
      description: "Apprenez à formuler des requêtes pour l'analyse et la visualisation de données.",
      promptCategory: 'code',
      promptTemplate: "Je travaille sur un projet d'analyse de données concernant [SUJET/DOMAINE]. Aide-moi à:\n\n1. Définir 3-5 questions clés que je devrais explorer avec ces données\n2. Suggérer les meilleures visualisations pour chaque question (avec justification)\n3. Fournir un exemple de code Python utilisant pandas et matplotlib/seaborn pour créer une de ces visualisations\n4. Proposer des techniques d'analyse statistique appropriées",
      difficulty: 'avancé',
      expectedConcepts: ["Exploration de données", "Visualisation", "Analyse statistique"],
      explanation: "Ce prompt guide l'IA pour fournir une analyse complète du processus d'exploration de données: de la formulation des questions initiales aux techniques de visualisation appropriées, en passant par l'implémentation code et les méthodes statistiques. Cette approche méthodique est essentielle pour une analyse de données rigoureuse.",
      icon: <Search className="h-5 w-5 text-green-400" />
    }
  ];

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
          variant: "default"
        });
        
        setIsGenerating(false);
      }, 1500);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération.",
        variant: "destructive"
      });
    }
  };

  // Fonction auxiliaire pour formater le code dans les réponses générées
  const formatResponseContent = (content: string) => {
    // Support pour formatage Markdown
    if (content.includes('```')) {
      return (
        <div 
          dangerouslySetInnerHTML={{ 
            __html: content
              .replace(/```(python|javascript|html|css|sql|json)?([\s\S]*?)```/g, (match, lang, code) => {
                if (lang) {
                  return `<div style="margin: 16px 0;"><pre style="margin: 0;"><code class="language-${lang}">${code.trim()}</code></pre></div>`;
                } else {
                  return `<div style="margin: 16px 0;"><pre style="margin: 0;"><code>${code.trim()}</code></pre></div>`;
                }
              })
              .replace(/`([^`]+)`/g, '<code style="background-color: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px;">$1</code>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em>$1</em>')
              .replace(/# (.*?)$/gm, '<h1 style="font-size: 1.5rem; font-weight: bold; margin: 24px 0 12px 0;">$1</h1>')
              .replace(/## (.*?)$/gm, '<h2 style="font-size: 1.25rem; font-weight: bold; margin: 16px 0 8px 0;">$2</h2>')
              .replace(/^- (.*?)$/gm, '<li style="margin-left: 16px;">$1</li>')
              .replace(/\n\n/g, '<br><br>')
          }} />
      );
    }
    
    return <p className="whitespace-pre-wrap">{content}</p>;
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
              <h1 className="text-2xl font-bold text-white">AI Playground</h1>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/30 ml-2">
                BETA
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="theme-toggle" className="text-sm text-blue-200">Mode sombre</Label>
                <Switch
                  id="theme-toggle"
                  checked={highContrastMode}
                  onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'futuristic')}
                />
              </div>
              
              <div className="bg-blue-900/50 px-3 py-1 rounded-md border border-blue-400/20 flex items-center gap-2">
                <span className="text-xs text-blue-200">Score:</span>
                <span className="text-sm font-medium text-blue-100">{userScore}</span>
                {streak > 1 && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-400/30 ml-1 text-xs">
                    Streak x{streak}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Sidebar avec templates de prompts */}
            <div className="xl:col-span-3 space-y-6">
              <Card className="bg-blue-950/50 border-blue-800/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-white">Templates</CardTitle>
                    <Badge variant="secondary" className="bg-blue-700/30 text-blue-200 border-none">
                      {getFilteredTemplates().length}
                    </Badge>
                  </div>
                  <CardDescription className="text-blue-400">
                    Modèles de prompts prédéfinis pour vous aider à démarrer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {getFilteredTemplates().map((template) => (
                      <Card 
                        key={template.id} 
                        className={`bg-blue-900/30 border border-blue-700/30 hover:border-blue-400/50 transition-all cursor-pointer ${
                          selectedPromptTemplate?.id === template.id ? 'border-blue-400 bg-blue-800/50' : ''
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-sm text-white">{template.title}</CardTitle>
                          <CardDescription className="text-xs text-blue-300">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-950/50 border-blue-800/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Configuration</CardTitle>
                  <CardDescription className="text-blue-400">
                    Paramètres de génération
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-blue-200" htmlFor="model-select">Modèle</Label>
                    <Select 
                      value={selectedModel} 
                      onValueChange={setSelectedModel}
                    >
                      <SelectTrigger id="model-select" className="bg-blue-900/30 border-blue-700/50 text-white">
                        <SelectValue placeholder="Sélectionner un modèle" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-900 border-blue-700 text-white">
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Progress value={60} className="h-2 bg-blue-900/50" indicatorClassName="bg-blue-400" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-blue-400">Crédits: 60%</span>
                      <span className="text-xs text-blue-300">3000/5000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Espace principal de génération */}
            <div className="xl:col-span-9">
              <Card className="bg-blue-950/50 border-blue-800/50">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Terrain de jeu IA</CardTitle>
                  <CardDescription className="text-blue-400">
                    Expérimentez avec différents types de prompts pour comprendre le potentiel de l'IA
                  </CardDescription>
                  
                  <Tabs 
                    defaultValue="text-generation" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-4"
                  >
                    <TabsList className="bg-blue-900/50 text-blue-300">
                      <TabsTrigger 
                        value="text-generation"
                        className="data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Texte
                      </TabsTrigger>
                      <TabsTrigger 
                        value="code-generation"
                        className="data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                      >
                        <Code className="h-4 w-4 mr-2" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger 
                        value="ml-models"
                        className="data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        ML/IA
                      </TabsTrigger>
                      <TabsTrigger 
                        value="vision-analysis"
                        className="data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Vision
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-4">
                      <Label className="text-sm text-blue-200" htmlFor="prompt-input">Prompt</Label>
                      <div className="relative mt-1.5">
                        <Textarea
                          id="prompt-input"
                          placeholder={
                            activeTab === 'text-generation' 
                              ? "Entrez votre prompt ici... Par exemple: 'Explique-moi le concept de l'apprentissage par renforcement'"
                              : activeTab === 'code-generation'
                                ? "Entrez votre prompt ici... Par exemple: 'Écris une fonction Python qui trie une liste de dictionnaires par valeur'"
                                : activeTab === 'ml-models'
                                  ? "Entrez votre prompt ici... Par exemple: 'Comment implémenter un modèle de classification pour détecter des fraudes'"
                                  : "Entrez votre prompt ici... Vous pourrez bientôt télécharger des images pour analyse"
                          }
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          className="min-h-40 text-white bg-blue-900/30 border-blue-700/50 focus:border-blue-400"
                        />
                        <div className="absolute right-3 bottom-3 flex space-x-2">
                          {promptText && (
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 bg-blue-950/70 border-blue-700/50 text-blue-300 hover:bg-blue-800 hover:text-white"
                              onClick={() => setPromptText('')}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                            onClick={handleGenerate}
                            disabled={isGenerating || !promptText.trim()}
                          >
                            {isGenerating ? (
                              <>
                                <span className="animate-pulse">Génération en cours...</span>
                              </>
                            ) : (
                              <>
                                <Rocket className="mr-2 h-4 w-4" />
                                Générer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Tabs>
                </CardHeader>
                
                <Separator className="bg-blue-800/30" />
                
                {generatedResponses.length > 0 && (
                  <Card className="m-6 bg-blue-900/30 border-blue-700/50">
                    <CardHeader className="pb-2 flex flex-row justify-between items-start">
                      <div>
                        <CardTitle className="text-white flex items-center">
                          <Bot className="h-5 w-5 mr-2 text-cyan-400" />
                          Réponse
                          <Badge className="ml-3 bg-blue-700/50 text-blue-200">
                            {generatedResponses[0].model}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-blue-400">
                          Généré le {generatedResponses[0].timestamp.toLocaleTimeString()} • Type: {generatedResponses[0].promptType}
                        </CardDescription>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 bg-blue-950/70 border-blue-700/50 text-blue-300 hover:bg-blue-800 hover:text-white"
                              onClick={handleCopyToClipboard}
                            >
                              {showCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copier la réponse</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-invert max-w-none prose-headings:text-blue-100 prose-a:text-cyan-400 text-blue-100">
                        {activeTab === 'code-generation' ? (
                          <SyntaxHighlighter
                            language="python"
                            style={atomDark}
                            showLineNumbers
                            customStyle={{
                              backgroundColor: 'rgba(13, 20, 46, 0.6)',
                              borderRadius: '0.375rem',
                              padding: '1rem',
                              marginBottom: '1rem'
                            }}
                          >
                            {generatedResponses[0].content.match(/```python([\s\S]*?)```/)?.[1] || generatedResponses[0].content}
                          </SyntaxHighlighter>
                        ) : (
                          formatResponseContent(generatedResponses[0].content)
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Alert className="bg-blue-900/30 border-blue-500/30">
                        <Wand className="h-4 w-4" />
                        <AlertTitle>Conseil</AlertTitle>
                        <AlertDescription>
                          Pour améliorer vos résultats, essayez d'être plus spécifique dans vos prompts et d'inclure des exemples concrets.
                        </AlertDescription>
                      </Alert>
                    </CardFooter>
                  </Card>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlayground;