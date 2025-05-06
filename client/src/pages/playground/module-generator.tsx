import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  PlusCircle, 
  Check, 
  HelpCircle, 
  Code, 
  Send, 
  BookOpen, 
  Terminal, 
  BrainCircuit, 
  Layers, 
  PuzzleIcon, 
  SettingsIcon,
  Trophy,
  Loader2,
  Eye
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
import { Switch } from '@/components/ui/switch';
import HomeLayout from '@/components/layout/HomeLayout';

// Types pour le générateur de modules
interface ModuleConfig {
  name: string;
  domain: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  includeTestModule: boolean;
  includeTrainerModule: boolean;
  includeOpsModule: boolean;
  includeAscensionModule: boolean;
  gamificationLevel: 'low' | 'medium' | 'high';
  learningStyle: 'interactive' | 'reading' | 'mixed';
  additionalContext: string;
}

// Interface pour les informations client
interface ClientInfo {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectDetails: string;
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
    includeTestModule: true,
    includeTrainerModule: true,
    includeOpsModule: true,
    includeAscensionModule: true,
    gamificationLevel: 'medium',
    learningStyle: 'mixed',
    additionalContext: '',
  });
  
  // État des informations client
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    projectDetails: '',
  });

  // État pour le nouveau topic à ajouter
  const [newTopic, setNewTopic] = useState('');

  // État pour suivre la progression de la génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [generatedModules, setGeneratedModules] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<string>('config');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Gérer les changements de champs du module
  const handleInputChange = (field: keyof ModuleConfig, value: any) => {
    setModuleConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Gérer les changements de champs des informations client
  const handleClientInfoChange = (field: keyof ClientInfo, value: string) => {
    setClientInfo(prev => ({
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

  // Sauvegarder le module dans la base de données
  const saveModule = async () => {
    if (!generatedModules) {
      toast({
        title: 'Erreur',
        description: 'Veuillez d\'abord générer un module avant de le sauvegarder.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Préparation des données pour l'API de sauvegarde
      const moduleToSave = {
        name: moduleConfig.name,
        domain: moduleConfig.domain,
        description: generatedModules.description || moduleConfig.description,
        iamName: generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`,
        difficulty: moduleConfig.difficulty,
        topics: moduleConfig.topics,
        gamificationLevel: moduleConfig.gamificationLevel,
        learningStyle: moduleConfig.learningStyle,
        includeTrainerModule: moduleConfig.includeTrainerModule,
        includeOpsModule: moduleConfig.includeOpsModule,
        includeTestModule: moduleConfig.includeTestModule,
        includeAscensionModule: moduleConfig.includeAscensionModule,
        moduleData: generatedModules // Les données complètes générées
      };
      
      // Appel à l'API de sauvegarde
      const response = await fetch('/api/module-generator/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleToSave),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Module sauvegardé',
          description: 'Votre module a été sauvegardé avec succès !',
        });
      } else {
        throw new Error(data.message || 'Erreur lors de la sauvegarde du module.');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde du module.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Générer les modules
  const generateModules = async () => {
    // Vérifier que les champs obligatoires sont remplis
    if (!moduleConfig.name || !moduleConfig.domain || !moduleConfig.description) {
      toast({
        title: 'Champs obligatoires',
        description: 'Veuillez remplir tous les champs obligatoires (nom, domaine, description).',
        variant: 'destructive',
      });
      return;
    }

    if (moduleConfig.topics.length === 0) {
      toast({
        title: 'Sujets manquants',
        description: 'Veuillez ajouter au moins un sujet pour votre module.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Préparation des données pour l'API
      const requestData = {
        ...moduleConfig,
        // Créer le modèle de nom selon le format "I AM XXX"
        iamName: `I AM ${moduleConfig.domain.toUpperCase()}`
      };

      // Appel à l'API
      const response = await fetch('/api/module-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des modules');
      }

      const data = await response.json();
      
      setGeneratedModules(data.modules);
      setCurrentTab('result');
      
      toast({
        title: 'Génération réussie',
        description: 'Vos modules ont été générés avec succès !',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération des modules.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Soumettre une demande de module à l'équipe FYNE
  const submitModuleRequest = async () => {
    if (!generatedModules) {
      toast({
        title: 'Erreur',
        description: 'Veuillez d\'abord générer un module avant d\'envoyer votre demande.',
        variant: 'destructive',
      });
      return;
    }

    // Vérifier que les champs obligatoires pour le client sont remplis
    if (!clientInfo.companyName || !clientInfo.contactName || !clientInfo.contactEmail) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez remplir les informations client obligatoires (entreprise, nom, email).',
        variant: 'destructive',
      });
      return;
    }

    setIsRequesting(true);

    try {
      // Préparation des données pour l'API
      const requestData = {
        moduleConfig: {
          ...moduleConfig,
          iamName: generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`
        },
        clientInfo,
        moduleData: generatedModules
      };

      // Simulation d'un appel API (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Activer l'aperçu du module
      setPreviewMode(true);
      
      // Afficher la confirmation
      setRequestSubmitted(true);
      
      toast({
        title: 'Demande envoyée',
        description: 'Votre demande a été transmise à l\'équipe FYNE avec succès !',
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi de votre demande.',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  // Voir l'aperçu du module
  const viewModulePreview = () => {
    setPreviewMode(true);
  };

  // Retour à la page d'accueil
  const handleBack = () => {
    setLocation('/');
  };

  return (
    <HomeLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack} 
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-800 dark:text-white">Générateur de Modules</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Créez vos propres modules d'apprentissage personnalisés
            </p>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="result" disabled={!generatedModules}>Résultats</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-blue-800 dark:text-white">
                  Configuration de votre module
                </CardTitle>
                <CardDescription>
                  Définissez les caractéristiques de votre module d'apprentissage modulaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Informations de base</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="module-name">Nom du module *</Label>
                      <Input 
                        id="module-name" 
                        placeholder="ex: Cybersécurité Avancée" 
                        value={moduleConfig.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="module-domain">Domaine principal *</Label>
                      <Input 
                        id="module-domain" 
                        placeholder="ex: CYBER, DATA, DEV, CLOUD, etc."
                        value={moduleConfig.domain}
                        onChange={(e) => handleInputChange('domain', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ce sera utilisé pour créer un nom type "I AM XXX"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="module-description">Description *</Label>
                    <Textarea 
                      id="module-description" 
                      placeholder="Décrivez votre module et ses objectifs d'apprentissage"
                      value={moduleConfig.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

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
                </div>

                {/* Liste des sujets */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Sujets à couvrir *</h3>
                  
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Nouveau sujet à couvrir"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                    />
                    <Button 
                      type="button" 
                      onClick={addTopic}
                      disabled={!newTopic.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {moduleConfig.topics.map((topic, index) => (
                      <Badge 
                        key={index} 
                        className="flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {topic}
                        <button 
                          type="button" 
                          onClick={() => removeTopic(topic)}
                          className="ml-1 text-blue-800 dark:text-blue-200"
                        >
                          <span className="sr-only">Supprimer</span>
                          ×
                        </button>
                      </Badge>
                    ))}
                    {moduleConfig.topics.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucun sujet ajouté. Veuillez ajouter au moins un sujet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Structure des modules */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Structure des modules</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        <div>
                          <Label htmlFor="trainer-module">Module Trainer</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Apprentissage théorique</p>
                        </div>
                      </div>
                      <Switch 
                        id="trainer-module" 
                        checked={moduleConfig.includeTrainerModule}
                        onCheckedChange={(checked) => handleInputChange('includeTrainerModule', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center">
                        <SettingsIcon className="h-5 w-5 mr-2 text-green-600" />
                        <div>
                          <Label htmlFor="ops-module">Module OPS</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Application pratique</p>
                        </div>
                      </div>
                      <Switch 
                        id="ops-module" 
                        checked={moduleConfig.includeOpsModule}
                        onCheckedChange={(checked) => handleInputChange('includeOpsModule', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center">
                        <Layers className="h-5 w-5 mr-2 text-amber-600" />
                        <div>
                          <Label htmlFor="test-module">Module Test</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Évaluation des connaissances</p>
                        </div>
                      </div>
                      <Switch 
                        id="test-module" 
                        checked={moduleConfig.includeTestModule}
                        onCheckedChange={(checked) => handleInputChange('includeTestModule', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-purple-600" />
                        <div>
                          <Label htmlFor="ascension-module">Module Ascension</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Progression avancée</p>
                        </div>
                      </div>
                      <Switch 
                        id="ascension-module" 
                        checked={moduleConfig.includeAscensionModule}
                        onCheckedChange={(checked) => handleInputChange('includeAscensionModule', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Paramètres d'apprentissage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Paramètres d'apprentissage</h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="gamification">Niveau de gamification</Label>
                      <Select 
                        value={moduleConfig.gamificationLevel} 
                        onValueChange={(value) => handleInputChange('gamificationLevel', value)}
                      >
                        <SelectTrigger id="gamification">
                          <SelectValue placeholder="Sélectionnez un niveau" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Faible (très sérieux)</SelectItem>
                          <SelectItem value="medium">Moyen (équilibré)</SelectItem>
                          <SelectItem value="high">Élevé (ludique)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="learning-style">Style d'apprentissage</Label>
                      <Select 
                        value={moduleConfig.learningStyle} 
                        onValueChange={(value) => handleInputChange('learningStyle', value)}
                      >
                        <SelectTrigger id="learning-style">
                          <SelectValue placeholder="Sélectionnez un style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reading">Lecture (contenu théorique)</SelectItem>
                          <SelectItem value="interactive">Interactif (exercices pratiques)</SelectItem>
                          <SelectItem value="mixed">Mixte (théorie + pratique)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contexte supplémentaire */}
                <div className="space-y-2">
                  <Label htmlFor="additional-context">Contexte supplémentaire (optionnel)</Label>
                  <Textarea 
                    id="additional-context" 
                    placeholder="Ajoutez toute information additionnelle qui pourrait aider à mieux générer vos modules"
                    value={moduleConfig.additionalContext}
                    onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                {/* Informations client */}
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Informations client</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ces informations seront utilisées par l'équipe FYNE pour vous contacter concernant votre demande de création de module.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Nom de l'entreprise *</Label>
                      <Input 
                        id="company-name" 
                        placeholder="ex: mc2i Group" 
                        value={clientInfo.companyName}
                        onChange={(e) => handleClientInfoChange('companyName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Nom du contact *</Label>
                      <Input 
                        id="contact-name" 
                        placeholder="ex: Jean Dupont" 
                        value={clientInfo.contactName}
                        onChange={(e) => handleClientInfoChange('contactName', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email du contact *</Label>
                      <Input 
                        id="contact-email" 
                        type="email"
                        placeholder="ex: jean.dupont@example.com" 
                        value={clientInfo.contactEmail}
                        onChange={(e) => handleClientInfoChange('contactEmail', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Téléphone du contact</Label>
                      <Input 
                        id="contact-phone" 
                        placeholder="ex: 01 23 45 67 89" 
                        value={clientInfo.contactPhone}
                        onChange={(e) => handleClientInfoChange('contactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project-details">Détails du projet (optionnel)</Label>
                    <Textarea 
                      id="project-details" 
                      placeholder="Précisez le contexte du projet, les besoins spécifiques, les délais souhaités, etc."
                      value={clientInfo.projectDetails}
                      onChange={(e) => handleClientInfoChange('projectDetails', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={generateModules}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Générer les Modules
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="result">
            {generatedModules && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-blue-800 dark:text-white">
                      {generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`}
                    </CardTitle>
                    <CardDescription>
                      Module généré avec succès ! Voici la structure complète de votre module.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Description générale</h3>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                          {generatedModules.description || "Description non disponible"}
                        </p>
                      </div>

                      {/* Affichage des sous-modules générés */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Sous-modules générés</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {moduleConfig.includeTrainerModule && generatedModules.trainerModule && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="bg-blue-100 dark:bg-blue-900 px-4 py-2 font-medium flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                                {moduleConfig.domain}TRAINER
                              </div>
                              <div className="p-4 space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {generatedModules.trainerModule.description || "Description non disponible"}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {generatedModules.trainerModule.features?.map((feature: string, index: number) => (
                                    <Badge key={index} className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {moduleConfig.includeOpsModule && generatedModules.opsModule && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="bg-green-100 dark:bg-green-900 px-4 py-2 font-medium flex items-center">
                                <SettingsIcon className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                                {moduleConfig.domain}OPS
                              </div>
                              <div className="p-4 space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {generatedModules.opsModule.description || "Description non disponible"}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {generatedModules.opsModule.features?.map((feature: string, index: number) => (
                                    <Badge key={index} className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {moduleConfig.includeTestModule && generatedModules.testModule && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="bg-amber-100 dark:bg-amber-900 px-4 py-2 font-medium flex items-center">
                                <Layers className="h-5 w-5 mr-2 text-amber-600 dark:text-amber-400" />
                                {moduleConfig.domain}TEST
                              </div>
                              <div className="p-4 space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {generatedModules.testModule.description || "Description non disponible"}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {generatedModules.testModule.features?.map((feature: string, index: number) => (
                                    <Badge key={index} className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {moduleConfig.includeAscensionModule && generatedModules.ascensionModule && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="bg-purple-100 dark:bg-purple-900 px-4 py-2 font-medium flex items-center">
                                <Trophy className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                                {moduleConfig.domain}ASCENSION
                              </div>
                              <div className="p-4 space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {generatedModules.ascensionModule.description || "Description non disponible"}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {generatedModules.ascensionModule.features?.map((feature: string, index: number) => (
                                    <Badge key={index} className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                      {feature}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contenu proposé */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-white">Structure de contenu proposée</h3>
                        <div className="border rounded-md p-4 whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                          {generatedModules.contentStructure || "Structure de contenu non disponible"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  {/* Message de confirmation */}
                  {requestSubmitted && (
                    <div className="my-6 p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                            Demande transmise à l'équipe FYNE
                          </h3>
                          <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                            <p>Merci pour votre demande de module personnalisé. L'équipe FYNE a bien reçu votre projet et reviendra vers vous dans les meilleurs délais.</p>
                            <p className="mt-2">Un mail de confirmation a été envoyé à <strong>{clientInfo.contactEmail}</strong>.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Aperçu du module */}
                  {previewMode && (
                    <div className="mt-8 mb-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-800 to-purple-900 p-6 text-white">
                          <h3 className="text-2xl font-bold mb-2">{generatedModules.iamName || `I AM ${moduleConfig.domain.toUpperCase()}`}</h3>
                          <p className="opacity-90">{generatedModules.description || moduleConfig.description}</p>
                          
                          <div className="mt-4 flex flex-wrap gap-2">
                            {moduleConfig.topics.map((topic, idx) => (
                              <Badge key={idx} className="bg-white/20 text-white hover:bg-white/30">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-gray-100 dark:bg-gray-800">
                          {moduleConfig.includeTrainerModule && (
                            <div className="bg-white dark:bg-gray-900 p-4">
                              <div className="flex items-center text-blue-600 dark:text-blue-400 mb-2">
                                <BookOpen className="h-5 w-5 mr-2" />
                                <h4 className="font-semibold">{moduleConfig.domain}TRAINER</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Module d'apprentissage théorique
                              </p>
                            </div>
                          )}
                          
                          {moduleConfig.includeOpsModule && (
                            <div className="bg-white dark:bg-gray-900 p-4">
                              <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
                                <SettingsIcon className="h-5 w-5 mr-2" />
                                <h4 className="font-semibold">{moduleConfig.domain}OPS</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Module de pratique et d'application
                              </p>
                            </div>
                          )}
                          
                          {moduleConfig.includeTestModule && (
                            <div className="bg-white dark:bg-gray-900 p-4">
                              <div className="flex items-center text-amber-600 dark:text-amber-400 mb-2">
                                <Layers className="h-5 w-5 mr-2" />
                                <h4 className="font-semibold">{moduleConfig.domain}TEST</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Module d'évaluation des connaissances
                              </p>
                            </div>
                          )}
                          
                          {moduleConfig.includeAscensionModule && (
                            <div className="bg-white dark:bg-gray-900 p-4">
                              <div className="flex items-center text-purple-600 dark:text-purple-400 mb-2">
                                <Trophy className="h-5 w-5 mr-2" />
                                <h4 className="font-semibold">{moduleConfig.domain}ASCENSION</h4>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Module de progression avancée
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-white dark:bg-gray-900 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ce module apparaîtra ainsi sur votre plateforme après développement par l'équipe FYNE
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentTab('config')}
                    >
                      Retour à la configuration
                    </Button>
                    <div className="flex gap-2">
                      {!previewMode && (
                        <Button 
                          variant="secondary"
                          onClick={viewModulePreview}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu du module
                        </Button>
                      )}
                      
                      <Button
                        variant="default"
                        onClick={submitModuleRequest}
                        disabled={isRequesting || requestSubmitted || !generatedModules}
                      >
                        {isRequesting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : requestSubmitted ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Demande envoyée
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer la demande
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
}