
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function CustomModule() {
  const [scenarioName, setScenarioName] = useState('');
  const [description, setDescription] = useState('');
  const [currentTab, setCurrentTab] = useState('write');
  const [generatedStructure, setGeneratedStructure] = useState(null);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const response = await fetch('/api/scenarios/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: scenarioName,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      toast({
        title: "Scénario sauvegardé",
        description: "Votre scénario a été enregistré avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Créer un nouveau scénario</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-slate-600">
              Créez un scénario personnalisé en décrivant son déroulement en langage naturel.
              Notre système transformera automatiquement votre description en une structure interactive.
            </p>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="write">Écriture</TabsTrigger>
              <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
            </TabsList>

            <TabsContent value="write">
              <Card>
                <CardContent className="pt-6 space-y-6">
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
                    <Label htmlFor="description">Description du scénario</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le déroulement de votre scénario..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 h-[300px]"
                    />
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setCurrentTab('preview')}>
                      Prévisualiser
                    </Button>
                    <Button onClick={handleSave} disabled={!scenarioName || !description}>
                      Sauvegarder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview">
              <Card>
                <CardContent className="pt-6">
                  {generatedStructure ? (
                    <div>{/* Affichage de la prévisualisation */}</div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Générez d'abord une prévisualisation depuis l'onglet Écriture
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
