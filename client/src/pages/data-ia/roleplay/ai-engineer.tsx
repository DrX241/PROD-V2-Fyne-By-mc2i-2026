import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Braces, Code, Play, Save, Copy, FileCode, Cpu, 
  RefreshCw, BarChart, BrainCircuit, Settings, Sliders, UploadCloud, 
  BookOpen, CheckCircle, AlertCircle, HelpCircle, Search, 
  Layers, Database, GitBranch
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Exemple de modèles disponibles
const availableModels = [
  {
    id: "text-classification",
    name: "Classification de texte",
    description: "Catégoriser un texte en fonction de son contenu",
    inputType: "text",
    outputType: "category",
    parameters: [
      { id: "classes", name: "Classes", type: "text-array", default: "positif,négatif,neutre" },
      { id: "fine_tuning", name: "Fine-tuning", type: "boolean", default: false },
      { id: "model_size", name: "Taille du modèle", type: "select", options: ["small", "medium", "large"], default: "medium" }
    ]
  },
  {
    id: "text-generation",
    name: "Génération de texte",
    description: "Générer du texte à partir d'un prompt",
    inputType: "text",
    outputType: "text",
    parameters: [
      { id: "max_length", name: "Longueur maximale", type: "number", default: 100 },
      { id: "temperature", name: "Température", type: "range", min: 0, max: 1, step: 0.1, default: 0.7 },
      { id: "top_p", name: "Top P", type: "range", min: 0, max: 1, step: 0.1, default: 0.9 }
    ]
  },
  {
    id: "image-classification",
    name: "Classification d'images",
    description: "Identifier le contenu d'une image",
    inputType: "image",
    outputType: "category",
    parameters: [
      { id: "classes", name: "Classes", type: "text-array", default: "chien,chat,oiseau,autre" },
      { id: "confidence", name: "Seuil de confiance", type: "range", min: 0, max: 1, step: 0.1, default: 0.5 },
      { id: "model_architecture", name: "Architecture", type: "select", options: ["CNN", "ResNet", "EfficientNet"], default: "ResNet" }
    ]
  },
  {
    id: "sentiment-analysis",
    name: "Analyse de sentiment",
    description: "Déterminer le sentiment exprimé dans un texte",
    inputType: "text",
    outputType: "sentiment",
    parameters: [
      { id: "language", name: "Langue", type: "select", options: ["français", "anglais", "multi-langue"], default: "français" },
      { id: "granularity", name: "Granularité", type: "select", options: ["document", "phrase", "aspect"], default: "document" }
    ]
  },
  {
    id: "named-entity-recognition",
    name: "Reconnaissance d'entités nommées",
    description: "Identifier les entités dans un texte (personnes, lieux, organisations...)",
    inputType: "text",
    outputType: "entities",
    parameters: [
      { id: "entity_types", name: "Types d'entités", type: "text-array", default: "PERSON,LOCATION,ORGANIZATION,DATE" },
      { id: "language", name: "Langue", type: "select", options: ["français", "anglais", "multi-langue"], default: "français" }
    ]
  }
];

// Exemple de datasets d'entraînement
const trainingDatasets = [
  { id: "emotions", name: "Émotions dans les textes", size: "2.3 GB", samples: 25000, description: "Textes annotés avec 6 catégories d'émotions" },
  { id: "products", name: "Avis produits", size: "1.8 GB", samples: 18000, description: "Commentaires clients avec notes et catégories" },
  { id: "news", name: "Articles de presse", size: "3.5 GB", samples: 12000, description: "Articles de presse catégorisés par thème et source" },
  { id: "conversations", name: "Conversations client", size: "1.2 GB", samples: 8000, description: "Dialogues client-service annotés par intention" }
];

// Exemple d'historique de modèles créés
const modelHistory = [
  { 
    id: "model-20250415-1", 
    name: "Classifier-SentimentV2", 
    type: "text-classification", 
    createdAt: "2025-04-15", 
    accuracy: 92.3,
    status: "deployed"
  },
  { 
    id: "model-20250410-1", 
    name: "NER-FrenchNews", 
    type: "named-entity-recognition", 
    createdAt: "2025-04-10", 
    accuracy: 88.7,
    status: "training"
  },
  { 
    id: "model-20250402-1", 
    name: "Text-Generator-Creative", 
    type: "text-generation", 
    createdAt: "2025-04-02", 
    accuracy: null,
    status: "draft"
  }
];

// Exemple de prompt templates pour la génération
const promptTemplates = [
  { 
    id: "template-summary", 
    name: "Résumé de texte", 
    content: "Résume le texte suivant en {{length}} phrases tout en conservant les points clés:\n\n{{input}}"
  },
  { 
    id: "template-continuation", 
    name: "Continuation de texte", 
    content: "Continue le texte suivant de manière cohérente en respectant le style et le ton:\n\n{{input}}"
  },
  { 
    id: "template-translation", 
    name: "Traduction", 
    content: "Traduis le texte suivant du {{source_language}} vers le {{target_language}}:\n\n{{input}}"
  }
];

// Composant principal pour la page AI Engineer
export default function AIEngineer() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('model-creation');
  const [selectedModel, setSelectedModel] = useState(availableModels[0]);
  const [modelParameters, setModelParameters] = useState({});
  const [modelName, setModelName] = useState("");
  const [testInput, setTestInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [deploymentStage, setDeploymentStage] = useState("configuration");
  
  // Initialiser les paramètres du modèle
  useEffect(() => {
    if (selectedModel) {
      const defaultParams = {};
      selectedModel.parameters.forEach(param => {
        defaultParams[param.id] = param.default;
      });
      setModelParameters(defaultParams);
    }
  }, [selectedModel]);
  
  // Simuler un résultat de test du modèle
  const testModel = () => {
    if (!testInput.trim()) return;
    
    setIsProcessing(true);
    setTestResult(null);
    
    // Simuler un temps de traitement
    setTimeout(() => {
      let result;
      
      // Générer un résultat simulé en fonction du type de modèle
      if (selectedModel.id === "text-classification") {
        const classes = modelParameters.classes?.split(',') || ["positif", "négatif", "neutre"];
        const confidences = classes.map(c => ({ label: c, confidence: Math.random() }));
        confidences.sort((a, b) => b.confidence - a.confidence);
        
        result = {
          prediction: confidences[0].label,
          confidence: (confidences[0].confidence * 100).toFixed(2) + "%",
          allLabels: confidences.map(c => ({
            label: c.label,
            confidence: (c.confidence * 100).toFixed(2) + "%"
          }))
        };
      } 
      else if (selectedModel.id === "text-generation") {
        const generatedText = testInput + " " + generateRandomText(modelParameters.max_length || 100);
        result = {
          generatedText,
          tokensGenerated: Math.floor(Math.random() * 50) + 50,
          generationTime: (Math.random() * 2 + 0.5).toFixed(2) + "s"
        };
      }
      else if (selectedModel.id === "sentiment-analysis") {
        const sentiments = ["très positif", "positif", "neutre", "négatif", "très négatif"];
        const prediction = sentiments[Math.floor(Math.random() * sentiments.length)];
        const score = Math.random().toFixed(2);
        
        result = {
          sentiment: prediction,
          score: score,
          confidence: (parseFloat(score) * 100).toFixed(2) + "%"
        };
      }
      else if (selectedModel.id === "named-entity-recognition") {
        const entityTypes = modelParameters.entity_types?.split(',') || 
          ["PERSON", "LOCATION", "ORGANIZATION", "DATE"];
        
        const words = testInput.split(' ');
        const entities = [];
        
        for (let i = 0; i < words.length; i++) {
          if (Math.random() > 0.7) {
            entities.push({
              text: words[i],
              type: entityTypes[Math.floor(Math.random() * entityTypes.length)],
              startIndex: testInput.indexOf(words[i]),
              endIndex: testInput.indexOf(words[i]) + words[i].length,
              confidence: (Math.random() * 0.3 + 0.7).toFixed(2)
            });
          }
        }
        
        result = {
          entities,
          entityCount: entities.length,
          processingTime: (Math.random() * 0.5 + 0.1).toFixed(2) + "s"
        };
      }
      
      setTestResult(result);
      setIsProcessing(false);
    }, 1500);
  };
  
  // Simuler l'entraînement d'un modèle
  const startTraining = () => {
    if (!selectedDataset || !modelName) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simuler la progression de l'entraînement
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsTraining(false);
            setDeploymentStage("trained");
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };
  
  // Fonction pour générer du texte aléatoire
  const generateRandomText = (length) => {
    const words = [
      "intelligence", "artificielle", "modèle", "apprentissage", "données", 
      "algorithme", "prédiction", "analyse", "machine", "learning", "deep", 
      "réseau", "neuronal", "classification", "régression", "entraînement", 
      "validation", "précision", "rappel", "F1-score", "matrice", "confusion",
      "hyperparamètre", "optimisation", "gradient", "descente", "epoch", "batch"
    ];
    
    let result = "";
    const wordCount = Math.min(Math.floor(length / 7), 30);
    
    for (let i = 0; i < wordCount; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      result += word + " ";
      
      // Ajouter un point de temps en temps
      if (i > 0 && i % 8 === 0) {
        result += ". ";
      }
    }
    
    return result.trim();
  };
  
  // Simuler le déploiement d'un modèle
  const deployModel = () => {
    setDeploymentStage("deploying");
    
    setTimeout(() => {
      setDeploymentStage("deployed");
    }, 2000);
  };
  
  // Afficher le format de sortie approprié en fonction du type de modèle
  const renderModelOutput = () => {
    if (!testResult) return null;
    
    if (selectedModel.id === "text-classification") {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-purple-300">Prédiction</span>
              <h3 className="text-xl font-medium text-white">{testResult.prediction}</h3>
            </div>
            <Badge variant="outline" className="bg-purple-800/40 text-purple-200">
              Confiance: {testResult.confidence}
            </Badge>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Toutes les classes</h4>
            <div className="space-y-2">
              {testResult.allLabels.map((label, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={index === 0 ? "font-medium text-purple-200" : "text-slate-300"}>
                    {label.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-slate-700 rounded-full h-2.5">
                      <div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        style={{ width: label.confidence }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400">{label.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    else if (selectedModel.id === "text-generation") {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
            <h4 className="text-sm font-medium text-purple-300 mb-1">Texte généré</h4>
            <p className="text-white whitespace-pre-wrap">{testResult.generatedText}</p>
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>Tokens générés: {testResult.tokensGenerated}</span>
            <span>Temps: {testResult.generationTime}</span>
          </div>
        </div>
      );
    }
    else if (selectedModel.id === "sentiment-analysis") {
      const getSentimentColor = () => {
        switch (testResult.sentiment) {
          case "très positif": return "text-green-400";
          case "positif": return "text-green-300";
          case "neutre": return "text-blue-300";
          case "négatif": return "text-orange-300";
          case "très négatif": return "text-red-400";
          default: return "text-white";
        }
      };
      
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-purple-300">Sentiment détecté</span>
              <h3 className={`text-xl font-medium ${getSentimentColor()}`}>
                {testResult.sentiment}
              </h3>
            </div>
            <Badge variant="outline" className="bg-purple-800/40 text-purple-200">
              Score: {testResult.score}
            </Badge>
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  testResult.sentiment.includes("positif") ? "bg-green-500" : 
                  testResult.sentiment.includes("négatif") ? "bg-red-500" : 
                  "bg-blue-500"
                }`}
                style={{ width: testResult.confidence }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400">
              <span>Négatif</span>
              <span>Neutre</span>
              <span>Positif</span>
            </div>
          </div>
        </div>
      );
    }
    else if (selectedModel.id === "named-entity-recognition") {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Entités détectées</h4>
            
            {testInput && (
              <div className="relative">
                <p className="text-white whitespace-pre-wrap">
                  {testInput.split('').map((char, i) => {
                    const entity = testResult.entities.find(
                      e => i >= e.startIndex && i < e.endIndex
                    );
                    
                    if (entity) {
                      const getEntityColor = (type) => {
                        switch (type) {
                          case "PERSON": return "bg-purple-500/20 text-purple-200 border-purple-500/50";
                          case "LOCATION": return "bg-blue-500/20 text-blue-200 border-blue-500/50";
                          case "ORGANIZATION": return "bg-green-500/20 text-green-200 border-green-500/50";
                          case "DATE": return "bg-yellow-500/20 text-yellow-200 border-yellow-500/50";
                          default: return "bg-slate-500/20 text-slate-200 border-slate-500/50";
                        }
                      };
                      
                      return (
                        <span
                          key={i}
                          className={`${getEntityColor(entity.type)} px-0 py-0.5 rounded border`}
                        >
                          {char}
                        </span>
                      );
                    }
                    
                    return <span key={i}>{char}</span>;
                  })}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-purple-300 mb-2">Légende</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-purple-500/50 border border-purple-500 rounded"></span>
                <span className="text-sm text-slate-300">PERSON</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-blue-500/50 border border-blue-500 rounded"></span>
                <span className="text-sm text-slate-300">LOCATION</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-500/50 border border-green-500 rounded"></span>
                <span className="text-sm text-slate-300">ORGANIZATION</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-yellow-500/50 border border-yellow-500 rounded"></span>
                <span className="text-sm text-slate-300">DATE</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-300">
            <span>{testResult.entityCount} entités détectées</span>
            <span>Temps: {testResult.processingTime}</span>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Rendu des paramètres du modèle en fonction de leur type
  const renderModelParameter = (param) => {
    const value = modelParameters[param.id];
    
    switch (param.type) {
      case "text":
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>{param.name}</Label>
            <Input 
              id={param.id}
              value={value || ""}
              onChange={(e) => setModelParameters({...modelParameters, [param.id]: e.target.value})}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        );
        
      case "text-array":
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>{param.name} (séparés par des virgules)</Label>
            <Input 
              id={param.id}
              value={value || ""}
              onChange={(e) => setModelParameters({...modelParameters, [param.id]: e.target.value})}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        );
        
      case "number":
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>{param.name}</Label>
            <Input 
              id={param.id}
              type="number"
              value={value || 0}
              onChange={(e) => setModelParameters({...modelParameters, [param.id]: parseInt(e.target.value)})}
              className="bg-slate-800 border-slate-700"
            />
          </div>
        );
        
      case "range":
        return (
          <div key={param.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor={param.id}>{param.name}</Label>
              <span className="text-sm text-slate-400">{value}</span>
            </div>
            <Slider
              id={param.id}
              min={param.min || 0}
              max={param.max || 1}
              step={param.step || 0.1}
              value={[value || 0]}
              onValueChange={(vals) => setModelParameters({...modelParameters, [param.id]: vals[0]})}
              className="py-2"
            />
          </div>
        );
        
      case "boolean":
        return (
          <div key={param.id} className="flex items-center justify-between space-y-0 py-2">
            <Label htmlFor={param.id}>{param.name}</Label>
            <Switch
              id={param.id}
              checked={value || false}
              onCheckedChange={(checked) => setModelParameters({...modelParameters, [param.id]: checked})}
            />
          </div>
        );
        
      case "select":
        return (
          <div key={param.id} className="space-y-2">
            <Label htmlFor={param.id}>{param.name}</Label>
            <Select 
              value={value || ""}
              onValueChange={(val) => setModelParameters({...modelParameters, [param.id]: val})}
            >
              <SelectTrigger id={param.id} className="bg-slate-800 border-slate-700">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                {param.options && param.options.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-slate-950 text-slate-200">
      <Helmet>
        <title>AI Engineer | Créer des modèles d'IA</title>
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
          <h1 className="text-3xl font-bold gradient-text bg-gradient-to-r from-purple-400 to-indigo-600 bg-clip-text text-transparent">
            AI Engineer Lab
          </h1>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-300">
            Bienvenue dans l'environnement de développement IA où vous pouvez créer, entraîner et déployer des modèles d'intelligence artificielle.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700">
            <TabsList className="bg-transparent border-b-0 py-2 justify-start">
              <TabsTrigger 
                value="model-creation" 
                className="data-[state=active]:bg-purple-800/40 rounded-md px-4"
              >
                <Braces className="h-4 w-4 mr-2" />
                Création de modèle
              </TabsTrigger>
              <TabsTrigger 
                value="training" 
                className="data-[state=active]:bg-purple-800/40 rounded-md px-4"
              >
                <Cpu className="h-4 w-4 mr-2" />
                Entraînement
              </TabsTrigger>
              <TabsTrigger 
                value="deployment" 
                className="data-[state=active]:bg-purple-800/40 rounded-md px-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Déploiement
              </TabsTrigger>
              <TabsTrigger 
                value="model-hub" 
                className="data-[state=active]:bg-purple-800/40 rounded-md px-4"
              >
                <Layers className="h-4 w-4 mr-2" />
                Modèles disponibles
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Onglet Création de modèle */}
          <TabsContent value="model-creation" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 bg-slate-800/50 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-300">
                    <BrainCircuit className="h-5 w-5 mr-2" />
                    Types de modèles
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le type de modèle que vous souhaitez créer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {availableModels.map(model => (
                      <div 
                        key={model.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedModel.id === model.id 
                            ? 'bg-purple-900/30 border border-purple-600/50' 
                            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                        }`}
                        onClick={() => setSelectedModel(model)}
                      >
                        <div className="font-medium text-purple-200">{model.name}</div>
                        <div className="text-sm text-slate-300 mt-1">{model.description}</div>
                        <div className="flex items-center mt-2 space-x-2">
                          <Badge variant="outline" className="bg-slate-800/80 text-xs">
                            Entrée: {model.inputType}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-800/80 text-xs">
                            Sortie: {model.outputType}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    Configuration du modèle
                  </CardTitle>
                  <CardDescription>
                    {selectedModel.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label htmlFor="model-name">Nom du modèle</Label>
                      <Input 
                        id="model-name"
                        placeholder="Mon modèle de classification"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    
                    <Separator className="my-6 bg-slate-700" />
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-purple-300">Paramètres</h3>
                      {selectedModel.parameters.map(param => renderModelParameter(param))}
                    </div>
                    
                    <Separator className="my-6 bg-slate-700" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-purple-300">Test du modèle</h3>
                      <div className="space-y-4">
                        <Label htmlFor="test-input">Entrée de test</Label>
                        <Textarea 
                          id="test-input"
                          placeholder={`Entrez un exemple de texte pour tester le modèle de ${selectedModel.name.toLowerCase()}...`}
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          className="bg-slate-800 border-slate-700 min-h-[120px]"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={testModel}
                          disabled={isProcessing || !testInput.trim()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Traitement...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Tester le modèle
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {testResult && (
                        <div className="mt-6 p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                          <h3 className="text-lg font-medium text-purple-300 mb-4">Résultat</h3>
                          {renderModelOutput()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="border-slate-600">
                    Enregistrer comme brouillon
                  </Button>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setActiveTab('training')}
                    disabled={!modelName}
                  >
                    Passer à l'entraînement
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300">
                  Guide de bonnes pratiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-purple-300 hover:text-purple-200">
                      Choix du type de modèle
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300">
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Analysez bien la nature de votre problème : est-ce de la classification, de la régression, de la génération ?</li>
                        <li>Pensez aux données dont vous disposez et à leur format</li>
                        <li>Pour les tâches complexes, privilégiez les architectures profondes</li>
                        <li>Pour les petits jeux de données, optez pour des modèles plus simples avec moins de paramètres</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-purple-300 hover:text-purple-200">
                      Configuration des hyperparamètres
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300">
                      <ul className="space-y-2 list-disc list-inside">
                        <li>La température contrôle la créativité du modèle : basse pour des réponses plus déterministes, haute pour plus de diversité</li>
                        <li>Le nombre de classes doit être adapté à votre cas d'usage et à la granularité souhaitée</li>
                        <li>Pour les modèles génératifs, limitez la longueur maximale pour éviter les dérives</li>
                        <li>Le fine-tuning est recommandé lorsque vous disposez d'un jeu de données spécifique à votre domaine</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-purple-300 hover:text-purple-200">
                      Évaluation des performances
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300">
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Utilisez plusieurs métriques : précision, rappel, F1-score pour la classification</li>
                        <li>Évaluez votre modèle sur un jeu de données de test indépendant</li>
                        <li>Pour les modèles génératifs, évaluez la cohérence, la pertinence et la diversité des sorties</li>
                        <li>N'hésitez pas à faire évaluer vos résultats par des humains pour les tâches subjectives</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Onglet Entraînement */}
          <TabsContent value="training" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 bg-slate-800/50 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-300">
                    <Database className="h-5 w-5 mr-2" />
                    Jeux de données
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez un jeu de données pour l'entraînement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingDatasets.map(dataset => (
                      <div 
                        key={dataset.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedDataset?.id === dataset.id 
                            ? 'bg-purple-900/30 border border-purple-600/50' 
                            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                        }`}
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <div className="font-medium text-purple-200">{dataset.name}</div>
                        <div className="text-sm text-slate-300 mt-1">{dataset.description}</div>
                        <div className="flex items-center mt-2 space-x-2 text-xs text-slate-400">
                          <span>Taille: {dataset.size}</span>
                          <span>•</span>
                          <span>{dataset.samples} échantillons</span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6">
                      <Button variant="outline" className="w-full border-dashed border-slate-600">
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Importer un jeu de données
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    Configuration de l'entraînement
                  </CardTitle>
                  <CardDescription>
                    {selectedModel.name} - {modelName || "Modèle sans nom"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {!selectedDataset ? (
                      <Alert className="bg-purple-900/20 border-purple-700">
                        <HelpCircle className="h-4 w-4 text-purple-400" />
                        <AlertTitle>Sélection nécessaire</AlertTitle>
                        <AlertDescription>
                          Veuillez sélectionner un jeu de données dans la liste pour configurer l'entraînement.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                          <h3 className="text-lg font-medium text-purple-300 mb-4">Paramètres d'entraînement</h3>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="epochs">Nombre d'époques</Label>
                                <Input 
                                  id="epochs"
                                  type="number"
                                  defaultValue={10}
                                  className="bg-slate-800 border-slate-700"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="batch-size">Taille de batch</Label>
                                <Input 
                                  id="batch-size"
                                  type="number"
                                  defaultValue={32}
                                  className="bg-slate-800 border-slate-700"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="learning-rate">Taux d'apprentissage</Label>
                                <Input 
                                  id="learning-rate"
                                  type="number"
                                  defaultValue={0.001}
                                  step={0.0001}
                                  className="bg-slate-800 border-slate-700"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="validation-split">Split de validation (%)</Label>
                                <Input 
                                  id="validation-split"
                                  type="number"
                                  defaultValue={20}
                                  min={0}
                                  max={50}
                                  className="bg-slate-800 border-slate-700"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="early-stopping">Early stopping</Label>
                                <Switch id="early-stopping" defaultChecked={true} />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                          <h3 className="text-lg font-medium text-purple-300 mb-4">Ressources de calcul</h3>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Type d'accélération</Label>
                              <RadioGroup defaultValue="gpu" className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cpu" id="cpu" />
                                  <Label htmlFor="cpu" className="font-normal">CPU</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="gpu" id="gpu" />
                                  <Label htmlFor="gpu" className="font-normal">GPU</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="tpu" id="tpu" disabled />
                                  <Label htmlFor="tpu" className="font-normal text-slate-500">TPU (indisponible)</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="distributed">Entraînement distribué</Label>
                                <Switch id="distributed" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="instance-type">Type d'instance</Label>
                              <Select defaultValue="medium">
                                <SelectTrigger id="instance-type" className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">Petite (2 vCPU, 8GB RAM)</SelectItem>
                                  <SelectItem value="medium">Moyenne (4 vCPU, 16GB RAM)</SelectItem>
                                  <SelectItem value="large">Large (8 vCPU, 32GB RAM)</SelectItem>
                                  <SelectItem value="xlarge">XL (16 vCPU, 64GB RAM)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        
                        {isTraining && (
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium text-purple-300">Progression de l'entraînement</h3>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span>Progression globale</span>
                                <span>{Math.round(trainingProgress)}%</span>
                              </div>
                              <Progress value={trainingProgress} className="h-2" />
                              
                              <div className="bg-slate-900/50 p-3 rounded-md border border-slate-800 font-mono text-xs text-slate-300 h-32 overflow-y-auto">
                                {Array.from({ length: Math.ceil(trainingProgress / 5) }).map((_, i) => (
                                  <div key={i} className={i % 2 === 0 ? "text-slate-300" : "text-slate-400"}>
                                    Epoch {Math.floor(i/2)+1}/{10}, batch {(i%2)*50+1}-{(i%2+1)*50}/100: loss: {(1 - (i/20)).toFixed(4)}, accuracy: {(0.7 + (i/50)).toFixed(4)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-slate-600"
                    onClick={() => setActiveTab('model-creation')}
                  >
                    Retour à la configuration
                  </Button>
                  {!isTraining ? (
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={!selectedDataset || !modelName}
                      onClick={startTraining}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Lancer l'entraînement
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive" 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Arrêter l'entraînement
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Onglet Déploiement */}
          <TabsContent value="deployment" className="m-0 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 bg-slate-800/50 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-300">
                    <Cpu className="h-5 w-5 mr-2" />
                    Modèles entraînés
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez un modèle à déployer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modelHistory.map(model => (
                      <div 
                        key={model.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          model.id === 'model-20250415-1' 
                            ? 'bg-purple-900/30 border border-purple-600/50' 
                            : 'bg-slate-700/30 hover:bg-slate-700/50 border border-transparent'
                        }`}
                      >
                        <div className="font-medium text-purple-200">{model.name}</div>
                        <div className="text-sm text-slate-300 mt-1">{availableModels.find(m => m.id === model.type)?.name}</div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-slate-400">
                            Créé le {model.createdAt}
                          </div>
                          <Badge 
                            variant={
                              model.status === 'deployed' ? 'default' : 
                              model.status === 'training' ? 'secondary' : 'outline'
                            }
                            className={
                              model.status === 'deployed' ? 'bg-green-800/60 hover:bg-green-800/80' : 
                              model.status === 'training' ? 'bg-blue-800/60 hover:bg-blue-800/80' : ''
                            }
                          >
                            {model.status === 'deployed' ? 'Déployé' : 
                            model.status === 'training' ? 'En entraînement' : 'Brouillon'}
                          </Badge>
                        </div>
                        {model.accuracy && (
                          <div className="mt-2 text-xs text-slate-400">
                            Précision: {model.accuracy}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    Déploiement du modèle
                  </CardTitle>
                  <CardDescription>
                    Classifier-SentimentV2 (Classification de texte)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {deploymentStage === "configuration" ? (
                      <>
                        <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                          <h3 className="text-lg font-medium text-purple-300 mb-4">Options de déploiement</h3>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="endpoint-name">Nom de l'endpoint</Label>
                              <Input 
                                id="endpoint-name"
                                defaultValue="sentiment-classifier-v2"
                                className="bg-slate-800 border-slate-700"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="instance-type">Type d'instance</Label>
                              <Select defaultValue="standard">
                                <SelectTrigger id="instance-type" className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="micro">Micro (faible trafic)</SelectItem>
                                  <SelectItem value="standard">Standard (trafic modéré)</SelectItem>
                                  <SelectItem value="performance">Performance (trafic élevé)</SelectItem>
                                  <SelectItem value="gpu">GPU (inférence complexe)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="autoscaling">Scaling automatique</Label>
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex justify-between text-xs text-slate-400">
                                    <span>Min. instances</span>
                                    <span>Max. instances</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Input 
                                      type="number"
                                      defaultValue={1}
                                      min={1}
                                      max={10}
                                      className="bg-slate-800 border-slate-700"
                                    />
                                    <span>-</span>
                                    <Input 
                                      type="number"
                                      defaultValue={5}
                                      min={1}
                                      max={20}
                                      className="bg-slate-800 border-slate-700"
                                    />
                                  </div>
                                </div>
                                <Switch defaultChecked={true} />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 space-y-2">
                                <Label htmlFor="monitoring">Surveillance des performances</Label>
                                <Select defaultValue="basic">
                                  <SelectTrigger id="monitoring" className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Aucune</SelectItem>
                                    <SelectItem value="basic">Basique</SelectItem>
                                    <SelectItem value="advanced">Avancée</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label htmlFor="version-control">Contrôle de version</Label>
                                <Select defaultValue="enabled">
                                  <SelectTrigger id="version-control" className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="disabled">Désactivé</SelectItem>
                                    <SelectItem value="enabled">Activé</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                          <h3 className="text-lg font-medium text-purple-300 mb-4">Configuration de l'API</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-1 space-y-2">
                                <Label htmlFor="auth-type">Type d'authentification</Label>
                                <Select defaultValue="key">
                                  <SelectTrigger id="auth-type" className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Aucune</SelectItem>
                                    <SelectItem value="key">Clé API</SelectItem>
                                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                                    <SelectItem value="jwt">JWT</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex-1 space-y-2">
                                <Label htmlFor="rate-limit">Limite de requêtes</Label>
                                <Select defaultValue="standard">
                                  <SelectTrigger id="rate-limit" className="bg-slate-800 border-slate-700">
                                    <SelectValue placeholder="Sélectionner..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Faible (100/min)</SelectItem>
                                    <SelectItem value="standard">Standard (500/min)</SelectItem>
                                    <SelectItem value="high">Élevée (2000/min)</SelectItem>
                                    <SelectItem value="unlimited">Illimitée</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="cors">Activer CORS</Label>
                                <Switch id="cors" defaultChecked={true} />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="allowed-origins">Origines autorisées (CORS)</Label>
                              <Input 
                                id="allowed-origins"
                                defaultValue="*"
                                className="bg-slate-800 border-slate-700"
                              />
                              <p className="text-xs text-slate-400 mt-1">
                                Séparez les origines par des virgules, ou utilisez * pour autoriser toutes les origines
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : deploymentStage === "deploying" ? (
                      <div className="p-8 flex flex-col items-center justify-center space-y-4">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-slate-700 animate-spin"></div>
                          <div className="absolute inset-3 bg-slate-900 rounded-full"></div>
                          <Upload className="absolute inset-0 m-auto h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-medium text-purple-300 mt-4">Déploiement en cours...</h3>
                        <p className="text-slate-400 max-w-md text-center">
                          Votre modèle est en cours de déploiement. Cette opération peut prendre quelques minutes.
                        </p>
                      </div>
                    ) : deploymentStage === "deployed" || deploymentStage === "trained" ? (
                      <div className="space-y-6">
                        <div className="flex justify-center mb-6">
                          <div className="bg-green-900/20 border border-green-600/30 rounded-full p-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                          </div>
                        </div>
                        
                        <div className="text-center space-y-2 mb-8">
                          <h2 className="text-2xl font-medium text-green-400">
                            {deploymentStage === "deployed" ? "Déploiement réussi !" : "Entraînement terminé !"}
                          </h2>
                          <p className="text-slate-300 max-w-md mx-auto">
                            {deploymentStage === "deployed" 
                              ? "Votre modèle est maintenant disponible via l'API et prêt à être utilisé dans vos applications."
                              : "Votre modèle est maintenant entraîné et prêt à être déployé."}
                          </p>
                        </div>
                        
                        {deploymentStage === "deployed" && (
                          <div className="p-4 bg-slate-800/80 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-medium text-purple-300 mb-4">Informations de l'endpoint</h3>
                            
                            <div className="space-y-4">
                              <div className="flex flex-col space-y-2">
                                <Label>URL de l'API</Label>
                                <div className="flex items-center">
                                  <code className="bg-slate-900 p-2 rounded text-sm text-slate-300 flex-1 overflow-x-auto">
                                    https://api.ialab.mc2i.fr/v1/models/sentiment-classifier-v2/predict
                                  </code>
                                  <Button variant="ghost" size="sm" className="ml-2 h-9 px-2">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <Label>Clé API</Label>
                                <div className="flex items-center">
                                  <code className="bg-slate-900 p-2 rounded text-sm text-slate-300 flex-1 overflow-x-auto">
                                    sk_api_7f9d8a6b2c4e1d3a5f7e9d8a6b2c4e1d3a5f7e9d
                                  </code>
                                  <Button variant="ghost" size="sm" className="ml-2 h-9 px-2">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <Label>Exemple de requête</Label>
                                <div className="bg-slate-900 p-3 rounded text-sm text-slate-300 overflow-x-auto font-mono">
                                  <div className="text-slate-500">// Exemple avec fetch</div>
                                  <div>fetch('https://api.ialab.mc2i.fr/v1/models/sentiment-classifier-v2/predict', {'{'}</div>
                                  <div className="pl-4">method: 'POST',</div>
                                  <div className="pl-4">headers: {'{'}</div>
                                  <div className="pl-8">Authorization: 'Bearer sk_api_7f9d8a6b2c4e1d3a5f7e9d8a6b2c4e1d3a5f7e9d',</div>
                                  <div className="pl-8">'Content-Type': 'application/json'</div>
                                  <div className="pl-4">{'}'},</div>
                                  <div className="pl-4">body: JSON.stringify({'{'}</div>
                                  <div className="pl-8">text: "Ce produit est vraiment formidable, je le recommande !"</div>
                                  <div className="pl-4">{'}'})</div>
                                  <div>{'}'})</div>
                                  <div>.then(response => response.json())</div>
                                  <div>.then(data => console.log(data));</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {deploymentStage === "configuration" ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-slate-600"
                        onClick={() => setActiveTab('training')}
                      >
                        Retour à l'entraînement
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={deployModel}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Déployer le modèle
                      </Button>
                    </>
                  ) : deploymentStage === "trained" ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-slate-600"
                        onClick={() => setActiveTab('training')}
                      >
                        Retour à l'entraînement
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => setDeploymentStage("configuration")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Configurer le déploiement
                      </Button>
                    </>
                  ) : deploymentStage === "deployed" ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-slate-600"
                        onClick={() => setActiveTab('model-hub')}
                      >
                        Voir tous les modèles
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <FileCode className="h-4 w-4 mr-2" />
                        Générer une documentation
                      </Button>
                    </>
                  ) : null}
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Onglet Hub de modèles */}
          <TabsContent value="model-hub" className="m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-purple-300">Classifier-SentimentV2</CardTitle>
                    <Badge className="bg-green-800/60">Déployé</Badge>
                  </div>
                  <CardDescription>
                    Classification de texte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Précision</span>
                      <span className="text-purple-300">92.3%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Créé le</span>
                      <span>15 avril 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Requêtes</span>
                      <span>1,254 / jour</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Latence</span>
                      <span>120 ms</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-center">
                  <Button variant="outline" className="w-full border-slate-600">
                    Gérer le modèle
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-purple-300">NER-FrenchNews</CardTitle>
                    <Badge className="bg-blue-800/60">En entraînement</Badge>
                  </div>
                  <CardDescription>
                    Reconnaissance d'entités nommées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progression</span>
                      <span className="text-purple-300">78%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Créé le</span>
                      <span>10 avril 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Échantillons</span>
                      <span>12,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Temps restant</span>
                      <span>~35 min</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-center">
                  <Button variant="outline" className="w-full border-slate-600">
                    Voir la progression
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-purple-300">Text-Generator-Creative</CardTitle>
                    <Badge variant="outline">Brouillon</Badge>
                  </div>
                  <CardDescription>
                    Génération de texte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Statut</span>
                      <span className="text-purple-300">Non entraîné</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Créé le</span>
                      <span>2 avril 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Paramètres</span>
                      <span>Max: 150 tokens</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Température</span>
                      <span>0.8</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-center">
                  <Button variant="outline" className="w-full border-slate-600">
                    Continuer la configuration
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-slate-900/60 border-slate-800 border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-300 text-center">Créer un nouveau modèle</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-purple-900/20 p-4 mb-4">
                    <Plus className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-center text-slate-400 mb-4">
                    Commencez à configurer un nouveau modèle d'IA pour vos besoins spécifiques
                  </p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-center">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => setActiveTab('model-creation')}
                  >
                    Nouveau modèle
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-purple-300">
                  <Search className="h-5 w-5 inline-block mr-2" />
                  Explorer les modèles publics
                </CardTitle>
                <CardDescription>
                  Découvrez et utilisez des modèles pré-entraînés par la communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 hover:border-purple-700 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-purple-300">BERT-FR-base</h3>
                      <Badge variant="outline" className="text-xs">Communauté</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Modèle BERT pré-entraîné pour le français
                    </p>
                    <div className="mt-2 flex items-center text-xs text-slate-500">
                      <GitBranch className="h-3.5 w-3.5 mr-1" />
                      <span>125 dérivés</span>
                      <span className="mx-2">•</span>
                      <span>⭐ 4.8/5</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 hover:border-purple-700 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-purple-300">GPT-FR-small</h3>
                      <Badge variant="outline" className="text-xs">Officiel</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Modèle de génération de texte en français
                    </p>
                    <div className="mt-2 flex items-center text-xs text-slate-500">
                      <GitBranch className="h-3.5 w-3.5 mr-1" />
                      <span>318 dérivés</span>
                      <span className="mx-2">•</span>
                      <span>⭐ 4.9/5</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 hover:border-purple-700 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-purple-300">ResNet-50-ImageNet</h3>
                      <Badge variant="outline" className="text-xs">Officiel</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      Classification d'images avec ResNet-50
                    </p>
                    <div className="mt-2 flex items-center text-xs text-slate-500">
                      <GitBranch className="h-3.5 w-3.5 mr-1" />
                      <span>203 dérivés</span>
                      <span className="mx-2">•</span>
                      <span>⭐ 4.7/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" className="border-slate-600">
                    Voir tous les modèles publics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}