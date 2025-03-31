import React, { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Save, Play, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function AdminScenariosPage() {
  const { toast } = useToast();
  
  // États pour la création de scénario
  const [scenarioName, setScenarioName] = useState('');
  const [domainId, setDomainId] = useState('');
  const [difficulty, setDifficulty] = useState('intermediaire');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // États pour l'affichage et le traitement
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStructure, setGeneratedStructure] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('write');
  const [previewMode, setPreviewMode] = useState<'json' | 'preview'>('preview');

  // Fonction pour générer la prévisualisation
  const generatePreview = async () => {
    if (!description || description.length < 50) {
      toast({
        title: "Description trop courte",
        description: "Veuillez fournir une description plus détaillée du scénario.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/api/custom-scenarios/preview', {
        method: 'POST',
        body: JSON.stringify({
          description,
        }),
      });
      
      setGeneratedStructure(response);
      setCurrentTab('preview');
      setIsLoading(false);
      
      toast({
        title: "Prévisualisation générée",
        description: "La structure du scénario a été générée avec succès.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer la prévisualisation du scénario.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Fonction pour sauvegarder le scénario
  const saveScenario = async () => {
    if (!generatedStructure) {
      toast({
        title: "Génération requise",
        description: "Veuillez d'abord générer la structure du scénario.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Ajout des données manquantes au scénario
      const scenarioToSave = {
        ...generatedStructure,
        originalDescription: description,
        isPublic
      };
      
      // Si le nom a été modifié, utiliser celui saisi par l'utilisateur
      if (scenarioName) {
        scenarioToSave.name = scenarioName;
      }
      
      // Si le domaine a été spécifié, l'ajouter
      if (domainId) {
        scenarioToSave.domain = domainId;
      }
      
      // Envoi au serveur
      await apiRequest('/api/custom-scenarios', {
        method: 'POST',
        body: JSON.stringify(scenarioToSave),
      });
      
      setIsLoading(false);
      toast({
        title: "Scénario sauvegardé",
        description: "Le scénario a été sauvegardé avec succès et est maintenant disponible.",
        variant: "default"
      });
      
      // Redirection vers la liste des scénarios personnalisés
      setTimeout(() => {
        window.location.href = '/custom';
      }, 1500);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le scénario.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header avec navigation */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-bold">Administration des scénarios</h1>
          </div>
          <div>
            <Link href="/custom">
              <Button variant="outline">Voir tous les scénarios</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Introduction */}
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Créer un nouveau scénario</h2>
            <p className="text-slate-600 max-w-3xl">
              Créez un scénario personnalisé en décrivant son déroulement en langage naturel. 
              Notre système transformera automatiquement votre description en une structure interactive.
            </p>
          </div>

          {/* Onglets d'édition et prévisualisation */}
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="write">Écriture</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedStructure}>Prévisualisation</TabsTrigger>
            </TabsList>

            <TabsContent value="write">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="scenario-name">Nom du scénario</Label>
                        <Input 
                          id="scenario-name" 
                          placeholder="Ex: Gestion d'une attaque par ransomware" 
                          value={scenarioName}
                          onChange={(e) => setScenarioName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="domain">Domaine</Label>
                        <Select value={domainId} onValueChange={setDomainId}>
                          <SelectTrigger id="domain" className="mt-1">
                            <SelectValue placeholder="Sélectionnez un domaine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gestion-crise">Gestion de crise cyber</SelectItem>
                            <SelectItem value="rgpd">Protection des données personnelles/RGPD</SelectItem>
                            <SelectItem value="phishing">Ingénierie sociale et phishing</SelectItem>
                            <SelectItem value="incidents">Gestion des incidents de sécurité</SelectItem>
                            <SelectItem value="supply-chain">Sécurité de la chaîne d'approvisionnement</SelectItem>
                            <SelectItem value="gouvernance">Stratégie et gouvernance cybersécurité</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Niveau de difficulté */}
                    <div>
                      <Label>Niveau de difficulté</Label>
                      <div className="flex gap-4 mt-1">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="debutant" 
                            name="difficulty" 
                            value="debutant" 
                            checked={difficulty === "debutant"}
                            onChange={() => setDifficulty("debutant")}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="debutant" className="ml-2 text-sm text-gray-700">Débutant</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="intermediaire" 
                            name="difficulty" 
                            value="intermediaire"
                            checked={difficulty === "intermediaire"}
                            onChange={() => setDifficulty("intermediaire")} 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="intermediaire" className="ml-2 text-sm text-gray-700">Intermédiaire</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="expert" 
                            name="difficulty" 
                            value="expert"
                            checked={difficulty === "expert"}
                            onChange={() => setDifficulty("expert")} 
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="expert" className="ml-2 text-sm text-gray-700">Expert</label>
                        </div>
                      </div>
                    </div>

                    {/* Visibilité */}
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="public-scenario" 
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                      <Label htmlFor="public-scenario">Rendre ce scénario public</Label>
                    </div>

                    <Separator />

                    {/* Description en langage naturel */}
                    <div>
                      <Label htmlFor="description" className="text-lg font-semibold">Description du scénario</Label>
                      <p className="text-slate-500 text-sm mb-2">
                        Décrivez le déroulement complet du scénario en langage naturel. Incluez les personnages, 
                        les messages, les échanges et les objectifs pédagogiques.
                      </p>
                      <Textarea 
                        id="description" 
                        placeholder="Le scénario commence avec un email de Marion Lopez, Directrice Marketing, qui accueille l'utilisateur et lui demande de se présenter. Après la présentation, elle lui expose une situation de crise liée à une attaque ransomware..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[300px] mt-1"
                      />
                    </div>

                    {/* Guide de rédaction */}
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Conseils pour la rédaction
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                        <li>Commencez par décrire l'accueil et la présentation des interlocuteurs</li>
                        <li>Détaillez les échanges et les réponses attendues des utilisateurs</li>
                        <li>Précisez quand l'expert technique doit intervenir</li>
                        <li>Mentionnez les critères d'évaluation pour que le système puisse les analyser</li>
                        <li>Incluez les messages de fin et la conclusion du scénario</li>
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={generatePreview} 
                        disabled={isLoading || !description || description.length < 50}
                        className="gap-2"
                      >
                        {isLoading ? "Génération en cours..." : "Générer la prévisualisation"}
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              {generatedStructure && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      {/* Informations générées */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2">{generatedStructure.name}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`text-xs text-white px-2 py-1 rounded-full ${
                            generatedStructure.difficulty === 'expert' 
                              ? 'bg-red-500' 
                              : generatedStructure.difficulty === 'intermediaire' 
                                ? 'bg-amber-500' 
                                : 'bg-green-500'
                          }`}>
                            {generatedStructure.difficulty === 'debutant' 
                              ? 'Débutant'
                              : generatedStructure.difficulty === 'intermediaire'
                                ? 'Intermédiaire'
                                : 'Expert'}
                          </span>
                          <span className="text-xs text-white px-2 py-1 rounded-full bg-blue-500">
                            {generatedStructure.domain === 'gestion-crise' 
                              ? 'Gestion de crise' 
                              : generatedStructure.domain === 'rgpd' 
                                ? 'RGPD'
                                : generatedStructure.domain === 'phishing'
                                  ? 'Phishing'
                                  : generatedStructure.domain === 'incidents'
                                    ? 'Incidents'
                                    : generatedStructure.domain === 'supply-chain'
                                      ? 'Chaîne d\'approvisionnement'
                                      : 'Gouvernance'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            generatedStructure.isPublic 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {generatedStructure.isPublic ? 'Public' : 'Privé'}
                          </span>
                        </div>
                      </div>

                      {/* Toggle pour afficher la structure JSON ou la prévisualisation */}
                      <div className="mb-6">
                        <div className="flex items-center gap-4">
                          <Button 
                            variant={previewMode === 'preview' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setPreviewMode('preview')}
                          >
                            Prévisualisation
                          </Button>
                          <Button 
                            variant={previewMode === 'json' ? 'default' : 'outline'} 
                            size="sm"
                            onClick={() => setPreviewMode('json')}
                          >
                            Structure JSON
                          </Button>
                        </div>
                      </div>

                      {/* Affichage de la structure JSON ou de la prévisualisation */}
                      {previewMode === 'json' ? (
                        <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm max-h-[600px]">
                          {JSON.stringify(generatedStructure, null, 2)}
                        </pre>
                      ) : (
                        <div className="space-y-6 overflow-auto max-h-[600px]">
                          <h3 className="font-semibold text-lg">Déroulement du scénario</h3>
                          
                          {generatedStructure.steps.map((step: any, index: number) => (
                            <div key={step.id} className="border rounded-md p-4 bg-white">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">
                                    Étape {index + 1}
                                  </span>
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {step.type === 'email' ? 'Email' : 'Message'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">{step.id}</span>
                              </div>
                              
                              {step.actor && (
                                <div className="mb-2">
                                  <span className="font-medium">{step.actor.name}</span>
                                  <span className="text-gray-500 text-sm ml-2">({step.actor.role})</span>
                                </div>
                              )}
                              
                              <p className="text-gray-700 mb-2">{step.content}</p>
                              
                              {step.expectations && step.expectations.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium text-gray-500">Attentes:</span>
                                  <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                    {step.expectations.map((exp: string) => (
                                      <li key={exp}>{exp}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end gap-4 mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => setCurrentTab('write')}
                        >
                          Retour à l'édition
                        </Button>
                        <Button 
                          onClick={saveScenario} 
                          disabled={isLoading}
                          className="gap-2"
                        >
                          {isLoading ? "Sauvegarde en cours..." : "Sauvegarder le scénario"}
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <p>© {new Date().getFullYear()} FYNE - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}