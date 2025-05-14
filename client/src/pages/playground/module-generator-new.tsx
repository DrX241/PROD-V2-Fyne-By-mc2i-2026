import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  PlusCircle, 
  Check, 
  Send, 
  BookOpen, 
  Terminal, 
  PuzzleIcon, 
  SettingsIcon,
  Trophy,
  Loader2,
  Briefcase,
  Lightbulb,
  Sparkles,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';

// Types pour le générateur de modules
interface ModuleConfig {
  name: string;
  domain: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  gamificationLevel: 'low' | 'medium' | 'high';
  learningStyle: 'interactive' | 'reading' | 'mixed';
  additionalContext: string;
}

// Composant principal du générateur de modules
export default function ModuleGenerator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // État initial du formulaire
  const [moduleConfig, setModuleConfig] = useState<ModuleConfig>({
    name: '',
    domain: '',
    description: '',
    difficulty: 'intermediate',
    topics: [],
    gamificationLevel: 'medium',
    learningStyle: 'mixed',
    additionalContext: '',
  });

  // État pour le nouveau topic à ajouter
  const [newTopic, setNewTopic] = useState('');

  // État pour suivre la progression de la génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedModules, setGeneratedModules] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<string>('config');

  // Gérer les changements de champs
  const handleInputChange = (field: keyof ModuleConfig, value: any) => {
    setModuleConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Ajouter un nouveau topic
  const addTopic = () => {
    if (newTopic.trim() && !moduleConfig.topics.includes(newTopic.trim())) {
      setModuleConfig(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  // Supprimer un topic
  const removeTopic = (topicToRemove: string) => {
    setModuleConfig(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }));
  };

  // Générer le module
  const generateModule = async () => {
    if (!moduleConfig.name.trim() || !moduleConfig.description.trim() || !moduleConfig.domain.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires (nom, domaine, description)",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/module-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleConfig),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la génération du module');
      }

      setGeneratedModules(data.modules);
      setCurrentTab('preview');
      toast({
        title: "Génération réussie",
        description: "Le module a été généré avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération du module.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Sauvegarder le module généré
  const saveModule = async () => {
    if (!generatedModules) {
      toast({
        title: "Aucun module généré",
        description: "Veuillez d'abord générer un module",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const moduleToSave = {
        ...moduleConfig,
        moduleData: generatedModules,
        iamName: generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`,
      };

      const response = await fetch('/api/module-generator/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleToSave),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde du module');
      }

      toast({
        title: "Sauvegarde réussie",
        description: "Le module a été sauvegardé avec succès",
      });
      
      // Redirection vers la page d'accueil
      setLocation('/');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la sauvegarde du module.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HomeLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <Button onClick={() => setLocation('/')} variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Générateur de modules I AM</h1>
        </div>
        
        {/* Navigation par onglets */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!generatedModules}>
              <PuzzleIcon className="mr-2 h-4 w-4" />
              Aperçu du module
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet de configuration */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>
                  Définissez les caractéristiques de votre module "I AM [SUJET]"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du module</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Cybersécurité Offensive" 
                    value={moduleConfig.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">Domaine principal (I AM ...)</Label>
                  <Input 
                    id="domain" 
                    placeholder="Ex: CYBER OFFENSE" 
                    value={moduleConfig.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Ce sera le nom principal: "I AM {moduleConfig.domain || '[DOMAINE]'}"</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description et objectif du module</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Décrivez ce que l'utilisateur pourra apprendre avec ce module..." 
                    value={moduleConfig.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Niveau de difficulté</Label>
                    <Select 
                      value={moduleConfig.difficulty} 
                      onValueChange={(value) => handleInputChange('difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Débutant</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gamificationLevel">Niveau de gamification</Label>
                    <Select 
                      value={moduleConfig.gamificationLevel} 
                      onValueChange={(value) => handleInputChange('gamificationLevel', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible</SelectItem>
                        <SelectItem value="medium">Moyen</SelectItem>
                        <SelectItem value="high">Élevé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learningStyle">Style d'apprentissage</Label>
                  <Select 
                    value={moduleConfig.learningStyle} 
                    onValueChange={(value) => handleInputChange('learningStyle', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interactive">Interactif</SelectItem>
                      <SelectItem value="reading">Lecture</SelectItem>
                      <SelectItem value="mixed">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Thèmes et contexte</CardTitle>
                <CardDescription>
                  Définissez les thèmes spécifiques à couvrir dans votre module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Thèmes à couvrir</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {moduleConfig.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {topic}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1 text-gray-500 hover:text-gray-800"
                          onClick={() => removeTopic(topic)}
                        >
                          <span className="sr-only">Supprimer</span>
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajoutez un thème..."
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTopic();
                        }
                      }}
                    />
                    <Button onClick={addTopic} size="sm" className="shrink-0">
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Contexte supplémentaire</Label>
                  <Textarea 
                    id="additionalContext" 
                    placeholder="Informations additionnelles pour personnaliser le module..." 
                    value={moduleConfig.additionalContext}
                    onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={() => setLocation('/')}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  onClick={generateModule}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Générer le module
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet d'aperçu */}
          <TabsContent value="preview" className="space-y-4">
            {generatedModules && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-2xl">
                      {generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`}
                    </CardTitle>
                    <CardDescription className="text-center">
                      {generatedModules.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-gray-800 dark:text-white">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Structure du module</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {generatedModules.contentStructure || "Structure non disponible"}
                      </p>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sections du module</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Section Se Former */}
                      {generatedModules.seFormer && (
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-blue-50 dark:bg-blue-900 px-4 py-2 font-medium flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                            Se Former
                          </div>
                          <div className="p-4 space-y-2">
                            <p className="text-sm text-gray-700 dark:text-white">
                              {generatedModules.seFormer.description || "Description non disponible"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2 mb-3">
                              {generatedModules.seFormer.features?.map((feature: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {generatedModules.seFormer.modules && (
                              <div className="mt-3 border-t pt-3">
                                <h5 className="text-xs font-semibold mb-2 text-gray-800 dark:text-white">Modules de formation</h5>
                                <ul className="text-xs space-y-1.5 text-gray-700 dark:text-gray-200">
                                  {generatedModules.seFormer.modules.slice(0, 3).map((module: any, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <Lightbulb className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-1.5 mt-0.5 flex-shrink-0" />
                                      <span>{module.title}</span>
                                    </li>
                                  ))}
                                  {generatedModules.seFormer.modules.length > 3 && (
                                    <li className="text-xs text-gray-500 dark:text-gray-400">+{generatedModules.seFormer.modules.length - 3} autres modules</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Section S'Entraîner */}
                      {generatedModules.sEntrainer && (
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-green-50 dark:bg-green-900 px-4 py-2 font-medium flex items-center">
                            <Terminal className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                            S'Entraîner
                          </div>
                          <div className="p-4 space-y-2">
                            <p className="text-sm text-gray-700 dark:text-white">
                              {generatedModules.sEntrainer.description || "Description non disponible"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2 mb-3">
                              {generatedModules.sEntrainer.features?.map((feature: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {generatedModules.sEntrainer.exercices && (
                              <div className="mt-3 border-t pt-3">
                                <h5 className="text-xs font-semibold mb-2 text-gray-800 dark:text-white">Exercices pratiques</h5>
                                <ul className="text-xs space-y-1.5 text-gray-700 dark:text-gray-200">
                                  {generatedModules.sEntrainer.exercices.slice(0, 3).map((exercice: any, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mr-1.5 mt-0.5 flex-shrink-0" />
                                      <span>{exercice.title}</span>
                                    </li>
                                  ))}
                                  {generatedModules.sEntrainer.exercices.length > 3 && (
                                    <li className="text-xs text-gray-500 dark:text-gray-400">+{generatedModules.sEntrainer.exercices.length - 3} autres exercices</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Section S'Évaluer */}
                      {generatedModules.sEvaluer && (
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-amber-50 dark:bg-amber-900 px-4 py-2 font-medium flex items-center">
                            <PuzzleIcon className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                            S'Évaluer
                          </div>
                          <div className="p-4 space-y-2">
                            <p className="text-sm text-gray-700 dark:text-white">
                              {generatedModules.sEvaluer.description || "Description non disponible"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2 mb-3">
                              {generatedModules.sEvaluer.features?.map((feature: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {generatedModules.sEvaluer.evaluations && (
                              <div className="mt-3 border-t pt-3">
                                <h5 className="text-xs font-semibold mb-2 text-gray-800 dark:text-white">Méthodes d'évaluation</h5>
                                <ul className="text-xs space-y-1.5 text-gray-700 dark:text-gray-200">
                                  {generatedModules.sEvaluer.evaluations.slice(0, 3).map((evaluation: any, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mr-1.5 mt-0.5 flex-shrink-0" />
                                      <span>{evaluation.title}</span>
                                    </li>
                                  ))}
                                  {generatedModules.sEvaluer.evaluations.length > 3 && (
                                    <li className="text-xs text-gray-500 dark:text-gray-400">+{generatedModules.sEvaluer.evaluations.length - 3} autres évaluations</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Section Automatiser */}
                      {generatedModules.automatiser && (
                        <div className="border rounded-md overflow-hidden">
                          <div className="bg-purple-50 dark:bg-purple-900 px-4 py-2 font-medium flex items-center">
                            <Bot className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                            Automatiser
                          </div>
                          <div className="p-4 space-y-2">
                            <p className="text-sm text-gray-700 dark:text-white">
                              {generatedModules.automatiser.description || "Description non disponible"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2 mb-3">
                              {generatedModules.automatiser.features?.map((feature: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            {generatedModules.automatiser.outils && (
                              <div className="mt-3 border-t pt-3">
                                <h5 className="text-xs font-semibold mb-2 text-gray-800 dark:text-white">Outils d'automatisation</h5>
                                <ul className="text-xs space-y-1.5 text-gray-700 dark:text-gray-200">
                                  {generatedModules.automatiser.outils.slice(0, 3).map((outil: any, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                      <Trophy className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 mr-1.5 mt-0.5 flex-shrink-0" />
                                      <span>{outil.title}</span>
                                    </li>
                                  ))}
                                  {generatedModules.automatiser.outils.length > 3 && (
                                    <li className="text-xs text-gray-500 dark:text-gray-400">+{generatedModules.automatiser.outils.length - 3} autres outils</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      onClick={() => setCurrentTab('config')}
                      variant="outline"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button
                      onClick={saveModule}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sauvegarde en cours...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Sauvegarder et publier
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="mt-6 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                  <p>
                    <strong className="text-gray-900 dark:text-white">Note :</strong> Le module {generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`} 
                    contient les sections Se former, S'entraîner, S'évaluer et Automatiser avec leur contenu généré par IA.
                  </p>
                  <p className="mt-2">
                    Après avoir sauvegardé, le module sera disponible sur la page d'accueil.
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
}