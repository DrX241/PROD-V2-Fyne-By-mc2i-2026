import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight, 
  Briefcase, 
  Code, 
  Lightbulb, 
  ListChecks, 
  FileText, 
  Wand2, 
  Shield, 
  Bot, 
  PanelRight,
  Webhook,
  AlertCircle
} from 'lucide-react';

import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// Types pour les outils
interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  complexity: 'simple' | 'moyen' | 'avancé';
}

interface GenerationOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function AutomatiserCreer() {
  // États
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [toolDescription, setToolDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationComplete, setGenerationComplete] = useState<boolean>(false);
  const [generatedTool, setGeneratedTool] = useState<string>('');
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // Constantes pour les outils disponibles
  const toolTypes: Tool[] = [
    {
      id: 'policy',
      title: 'Politique de Sécurité',
      description: 'Créer un document de politique de sécurité adapté à votre organisation.',
      icon: <FileText className="h-8 w-8 text-blue-100" />,
      gradient: 'from-blue-700 to-blue-900',
      complexity: 'moyen'
    },
    {
      id: 'script',
      title: 'Script de Défense',
      description: 'Générer un script d\'automatisation pour des tâches de cybersécurité.',
      icon: <Code className="h-8 w-8 text-indigo-100" />,
      gradient: 'from-indigo-700 to-indigo-900',
      complexity: 'avancé'
    },
    {
      id: 'checklist',
      title: 'Checklist d\'Audit',
      description: 'Créer une liste de vérification pour auditer la sécurité d\'un système.',
      icon: <ListChecks className="h-8 w-8 text-green-100" />,
      gradient: 'from-green-700 to-green-900',
      complexity: 'simple'
    },
    {
      id: 'dashboard',
      title: 'Dashboard de Sécurité',
      description: 'Concevoir une maquette de tableau de bord pour surveiller la sécurité.',
      icon: <PanelRight className="h-8 w-8 text-purple-100" />,
      gradient: 'from-purple-700 to-purple-900',
      complexity: 'avancé'
    },
    {
      id: 'training',
      title: 'Module de Formation',
      description: 'Générer un module de formation sur un sujet de cybersécurité.',
      icon: <Lightbulb className="h-8 w-8 text-yellow-100" />,
      gradient: 'from-yellow-600 to-yellow-800',
      complexity: 'moyen'
    }
  ];
  
  // Options de format de sortie
  const formatOptions: GenerationOption[] = [
    {
      id: 'text',
      title: 'Document Texte',
      description: 'Format texte structuré, idéal pour les politiques et procédures.',
      icon: <FileText className="h-6 w-6 text-blue-400" />
    },
    {
      id: 'checklist',
      title: 'Checklist Interactive',
      description: 'Liste à cocher avec sections et sous-sections structurées.',
      icon: <ListChecks className="h-6 w-6 text-green-400" />
    },
    {
      id: 'code',
      title: 'Script Exécutable',
      description: 'Code commenté et prêt à l\'emploi avec instructions d\'utilisation.',
      icon: <Code className="h-6 w-6 text-indigo-400" />
    },
    {
      id: 'diagram',
      title: 'Diagramme/Schéma',
      description: 'Représentation visuelle pour les processus et architectures.',
      icon: <Webhook className="h-6 w-6 text-purple-400" />
    }
  ];
  
  // Fonction pour gérer le choix d'un outil
  const handleToolSelect = (id: string) => {
    setSelectedTool(id);
  };
  
  // Fonction pour gérer le choix d'un format
  const handleFormatSelect = (id: string) => {
    setSelectedFormat(id);
  };
  
  // Passer à l'étape suivante
  const goToNextStep = () => {
    if (activeStep === 1 && !selectedTool) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un type d'outil à créer",
        variant: "destructive"
      });
      return;
    }
    
    if (activeStep === 2 && !selectedFormat) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un format de sortie",
        variant: "destructive"
      });
      return;
    }
    
    if (activeStep === 3 && toolDescription.trim().length < 30) {
      toast({
        title: "Description trop courte",
        description: "Veuillez fournir une description plus détaillée (au moins 30 caractères)",
        variant: "destructive"
      });
      return;
    }
    
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };
  
  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  
  // Simuler la génération de l'outil avec délai et progression
  const generateTool = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simuler une analyse IA qui comprend la demande
    setTimeout(() => {
      const selectedToolObj = toolTypes.find(tool => tool.id === selectedTool);
      const selectedFormatObj = formatOptions.find(format => format.id === selectedFormat);
      
      setAiAnalysis(`Je vais créer un${selectedToolObj?.title.startsWith('A') || selectedToolObj?.title.startsWith('E') || selectedToolObj?.title.startsWith('I') || selectedToolObj?.title.startsWith('O') || selectedToolObj?.title.startsWith('U') ? 'e' : ''} ${selectedToolObj?.title} au format ${selectedFormatObj?.title}.\n\nVotre demande concerne: ${toolDescription.substring(0, 100)}...\n\nJe vais générer un contenu adapté à vos besoins spécifiques. Souhaitez-vous que je procède?`);
      
      // Simuler la progression
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setGenerationProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          const mockGeneratedTool = `# ${selectedToolObj?.title}\n\n## Introduction\nCe document a été généré pour répondre à vos besoins spécifiques en matière de cybersécurité.\n\n## Contenu principal\nVoici le contenu principal adapté à votre demande: "${toolDescription}"\n\n## Conclusion\nCe contenu est généré à titre d'exemple. Dans une implémentation réelle, ce serait du contenu généré par Azure OpenAI basé sur vos spécifications précises.`;
          
          setGeneratedTool(mockGeneratedTool);
          setGenerationComplete(true);
          setIsGenerating(false);
        }
      }, 150);
    }, 1500);
  };
  
  // Obtenir le titre de l'étape actuelle
  const getStepTitle = () => {
    switch (activeStep) {
      case 1:
        return "1. Choisir le type d'outil";
      case 2:
        return "2. Sélectionner le format";
      case 3:
        return "3. Décrire vos besoins";
      case 4:
        return "4. Génération de l'outil";
      default:
        return "";
    }
  };
  
  // Rendu de l'interface utilisateur
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link href="/cyber">
              <Button variant="ghost" className="text-blue-300 hover:text-blue-100 p-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à I AM CYBER
              </Button>
            </Link>
          </div>
          
          {/* En-tête */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center font-['Rajdhani',_sans-serif]">
              <Wand2 className="h-10 w-10 mr-3 text-blue-400" />
              AUTOMATISER / CRÉER
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto font-['Exo_2',_sans-serif]">
              Créez rapidement des outils de cybersécurité adaptés à vos besoins spécifiques
            </p>
          </motion.div>
          
          {/* Contenu principal */}
          <div className="max-w-4xl mx-auto bg-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-700/50 shadow-lg p-6">
            {/* Titre de l'étape actuelle */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white font-['Rajdhani',_sans-serif]">{getStepTitle()}</h2>
              <Separator className="mt-2 bg-blue-700/50" />
            </div>
            
            {/* Indicateur de progression */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className={`${activeStep >= 1 ? 'text-blue-300' : 'text-gray-500'}`}>Type d'outil</span>
                <span className={`${activeStep >= 2 ? 'text-blue-300' : 'text-gray-500'}`}>Format</span>
                <span className={`${activeStep >= 3 ? 'text-blue-300' : 'text-gray-500'}`}>Description</span>
                <span className={`${activeStep >= 4 ? 'text-blue-300' : 'text-gray-500'}`}>Génération</span>
              </div>
              <Progress value={activeStep * 25} className="h-2 bg-blue-900" indicatorClassName="bg-blue-500" />
            </div>
            
            {/* Étape 1: Sélection du type d'outil */}
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {toolTypes.map((tool) => (
                    <Card 
                      key={tool.id}
                      className={`cursor-pointer transition-all border ${
                        selectedTool === tool.id 
                          ? 'bg-blue-800/50 border-blue-400' 
                          : 'bg-blue-900/40 border-blue-700/50 hover:bg-blue-800/40'
                      }`}
                      onClick={() => handleToolSelect(tool.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient}`}>
                            {tool.icon}
                          </div>
                          <div>
                            <CardTitle className="text-white font-['Rajdhani',_sans-serif]">{tool.title}</CardTitle>
                            <Badge variant="outline" className="mt-1 bg-blue-900/70 text-xs">
                              {tool.complexity === 'simple' ? 'Simple' : 
                               tool.complexity === 'moyen' ? 'Intermédiaire' : 'Avancé'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-200 font-['Exo_2',_sans-serif]">{tool.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Étape 2: Sélection du format */}
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-blue-200 mb-4 font-['Exo_2',_sans-serif]">
                  Vous avez sélectionné: <span className="font-semibold text-white">
                    {toolTypes.find(tool => tool.id === selectedTool)?.title}
                  </span>
                </p>
                
                <h3 className="text-xl font-semibold text-white mb-3 font-['Rajdhani',_sans-serif]">Choisissez le format souhaité:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {formatOptions.map((format) => (
                    <Card 
                      key={format.id}
                      className={`cursor-pointer transition-all border ${
                        selectedFormat === format.id 
                          ? 'bg-blue-800/50 border-blue-400' 
                          : 'bg-blue-900/40 border-blue-700/50 hover:bg-blue-800/40'
                      }`}
                      onClick={() => handleFormatSelect(format.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-900/70">
                            {format.icon}
                          </div>
                          <CardTitle className="text-white font-['Rajdhani',_sans-serif]">{format.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-200 font-['Exo_2',_sans-serif]">{format.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Étape 3: Description des besoins */}
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <p className="text-blue-200 mb-2 font-['Exo_2',_sans-serif]">
                    Vous créez: <span className="font-semibold text-white">
                      {toolTypes.find(tool => tool.id === selectedTool)?.title}
                    </span> au format <span className="font-semibold text-white">
                      {formatOptions.find(format => format.id === selectedFormat)?.title}
                    </span>
                  </p>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="tool-description" className="text-white text-lg font-medium mb-2 block font-['Rajdhani',_sans-serif]">
                    Décrivez en détail ce que vous souhaitez créer:
                  </Label>
                  <Textarea 
                    id="tool-description"
                    placeholder="Décrivez votre besoin (ex: Je souhaite créer une politique de sécurité pour une PME de 50 employés dans le secteur médical, conforme au RGPD et couvrant les aspects de sécurité des postes de travail et des données sensibles...)"
                    className="min-h-[200px] bg-blue-900/40 border-blue-700 text-white placeholder:text-blue-400 font-['Exo_2',_sans-serif]"
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                  />
                  <p className="mt-2 text-sm text-blue-300">
                    {toolDescription.length} caractères 
                    {toolDescription.length < 30 && (
                      <span className="text-red-300"> (minimum recommandé: 30)</span>
                    )}
                  </p>
                </div>
                
                <div className="bg-blue-900/50 rounded-lg p-4 border border-blue-700 mb-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-400 mt-1" />
                    <div>
                      <h4 className="text-white font-medium mb-1 font-['Rajdhani',_sans-serif]">Conseils pour une génération optimale:</h4>
                      <ul className="text-blue-200 space-y-1 list-disc pl-5 font-['Exo_2',_sans-serif]">
                        <li>Soyez précis sur le contexte (taille d'organisation, secteur, etc.)</li>
                        <li>Mentionnez les réglementations spécifiques à respecter (RGPD, PCI-DSS, etc.)</li>
                        <li>Indiquez les systèmes ou technologies concernés</li>
                        <li>Précisez l'audience cible du document</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Étape 4: Génération et résultats */}
            {activeStep === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {!isGenerating && !generationComplete && aiAnalysis && (
                  <div className="mb-6">
                    <div className="bg-blue-800/30 rounded-lg p-5 border border-blue-700">
                      <div className="flex items-start gap-3 mb-4">
                        <Bot className="h-8 w-8 text-blue-400 shrink-0" />
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2 font-['Rajdhani',_sans-serif]">Analyse IA</h3>
                          <div className="text-blue-200 whitespace-pre-wrap font-['Exo_2',_sans-serif]">
                            {aiAnalysis}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={generateTool}
                        >
                          Générer maintenant
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {isGenerating && (
                  <div className="mb-6">
                    <Card className="bg-blue-900/30 border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-white font-['Rajdhani',_sans-serif]">Génération en cours...</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <Progress value={generationProgress} className="h-2 bg-blue-900" indicatorClassName="bg-blue-500" />
                          <p className="mt-2 text-sm text-blue-300 text-right">{generationProgress}%</p>
                        </div>
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                        <p className="text-center text-blue-200 font-['Exo_2',_sans-serif]">
                          Création de votre outil en cours, veuillez patienter...
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {generationComplete && (
                  <div className="mb-6">
                    <Card className="bg-blue-900/30 border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center font-['Rajdhani',_sans-serif]">
                          <Shield className="mr-2 h-5 w-5 text-green-400" />
                          Outil généré avec succès!
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-950/50 rounded-lg p-4 font-mono text-sm text-blue-200 max-h-[300px] overflow-y-auto mb-4 whitespace-pre-wrap">
                          {generatedTool}
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Télécharger
                          </Button>
                          <Button variant="outline" className="border-blue-600 text-blue-300 hover:bg-blue-800">
                            Copier
                          </Button>
                          <Button variant="outline" className="border-blue-600 text-blue-300 hover:bg-blue-800">
                            Modifier
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Navigation des étapes */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep}
                disabled={activeStep === 1}
                className="border-blue-700 text-blue-300 hover:bg-blue-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              
              {(activeStep < 4 || (activeStep === 4 && !isGenerating && !generationComplete)) && (
                <Button 
                  onClick={activeStep < 4 ? goToNextStep : generateTool}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isGenerating}
                >
                  {activeStep < 3 ? "Suivant" : 
                   activeStep === 3 ? "Valider" : 
                   "Générer"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {activeStep === 4 && generationComplete && (
                <Button 
                  onClick={() => {
                    setActiveStep(1);
                    setSelectedTool(null);
                    setSelectedFormat(null);
                    setToolDescription('');
                    setGenerationComplete(false);
                    setGeneratedTool('');
                    setAiAnalysis('');
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Créer un nouveau
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}