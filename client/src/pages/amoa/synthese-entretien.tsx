import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, UserCircle, ClipboardCopy, Download, Loader2, Check, AlertCircle } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SyntheseEntretien() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>('entretien');
  const [inputNotes, setInputNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [synthese, setSynthese] = useState<any | null>(null);
  const { toast } = useToast();

  // Structure pour organiser les champs de synthèse
  const syntheseFields = [
    { id: 'presentation', label: 'Présentation générale du profil', icon: '📝' },
    { id: 'impression', label: 'Premières impressions, posture', icon: '👤' },
    { id: 'motivation', label: 'Motivation pour le conseil, les SI, et mc2i', icon: '🔥' },
    { id: 'comprehension', label: 'Compréhension de nos métiers et renseignement sur le cabinet', icon: '🧠' },
    { id: 'projet', label: 'Projet professionnel (court / moyen / long terme)', icon: '🎯' },
    { id: 'potentiel', label: 'Potentiel vs ambition', icon: '⭐' },
    { id: 'processus', label: 'Processus en cours et calendrier de décision', icon: '📅' },
    { id: 'criteres', label: 'Critères de choix du candidat', icon: '🔍' },
    { id: 'forces', label: 'Forces et faiblesses de la candidature', icon: '💪' },
    { id: 'anglais', label: 'Niveau d\'anglais', icon: '🌐' },
    { id: 'specificites', label: 'Spécificités si stagiaire ou alternant', icon: '📋' },
    { id: 'decision', label: 'Raison de la décision finale', icon: '✅' },
    { id: 'synthese', label: 'Synthèse globale', icon: '📊' }
  ];

  // Fonction pour générer la synthèse à partir des notes
  const generateSynthese = async () => {
    if (!inputNotes.trim()) {
      toast({
        title: "Notes manquantes",
        description: "Veuillez entrer des notes d'entretien pour générer une synthèse.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/amoa/synthese-entretien', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: inputNotes }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la synthèse');
      }

      const data = await response.json();
      setSynthese(data.synthese);
      setActiveTab('resultats');
      
      toast({
        title: "Synthèse générée avec succès",
        description: "La synthèse a été générée et est prête à être consultée ou exportée.",
        variant: "default",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur de génération",
        description: "Une erreur est survenue lors de la génération de la synthèse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction de copie de la synthèse complète
  const copySynthese = () => {
    if (!synthese) return;
    
    const text = syntheseFields.map(field => 
      `${field.label}:\n${synthese[field.id] || 'Non spécifié'}\n\n`
    ).join('');
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copié !",
      description: "La synthèse a été copiée dans le presse-papiers.",
      variant: "default",
    });
  };

  // Fonction d'export en fichier texte
  const exportSynthese = () => {
    if (!synthese) return;
    
    const text = syntheseFields.map(field => 
      `${field.label}:\n${synthese[field.id] || 'Non spécifié'}\n\n`
    ).join('');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Synthese_Entretien_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exporté !",
      description: "La synthèse a été exportée au format texte.",
      variant: "default",
    });
  };

  // Composant pour afficher un champ de la synthèse
  const SyntheseField = ({ field }: { field: { id: string, label: string, icon: string } }) => (
    <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border-0 ring-1 ring-gray-100 dark:ring-gray-700/50 transition-all hover:shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <span className="text-lg">{field.icon}</span>
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{field.label}</h3>
      </div>
      <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 pl-2 border-l-2 border-emerald-200 dark:border-emerald-800/50">
        {synthese?.[field.id] || 'Non spécifié'}
      </p>
    </div>
  );

  // Simulation de données pour la démonstration avant la mise en place de l'API
  const generateDemoSynthese = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setSynthese({
        presentation: "Diplômé d'un Master MIAGE en 2022. Première expérience d'un an chez Accenture en tant que développeur Java/Angular. Actuellement en poste depuis 6 mois chez Sopra Steria comme consultant junior.",
        impression: "Candidat posé et à l'écoute. Bonne présentation, discours structuré. Attitude professionnelle et dynamique.",
        motivation: "Intéressé par le conseil pour la variété des missions et la proximité client. Attiré par mc2i pour sa taille humaine et sa spécialisation sectorielle.",
        comprehension: "Bonne compréhension générale de nos métiers. S'est bien renseigné sur le cabinet, a consulté notre site et nos publications LinkedIn.",
        projet: "Court terme : consolidation technique et progression vers plus d'autonomie. Moyen terme : gestion de petites équipes. Long terme : expertise fonctionnelle dans le secteur public.",
        potentiel: "Potentiel aligné avec son ambition. Capacités d'analyse solides, progression technique régulière.",
        processus: "En début de recherche, a commencé il y a 2 semaines. A également un processus chez Wavestone et Keyrus. Décision attendue d'ici 3 semaines.",
        criteres: "Critères principaux : ambiance de travail, variété des missions, perspectives d'évolution.",
        forces: "Forces : solide bagage technique, bonne communication, proactivité. Faiblesses : manque d'expérience managériale, besoin de renforcer vision stratégique.",
        anglais: "Niveau correct (B2). TOEIC 805, pratique occasionnelle en contexte professionnel.",
        specificites: "N/A (candidat expérimenté)",
        decision: "Avis favorable pour passage au 2ème entretien. Profil technique solide avec bon potentiel d'évolution.",
        synthese: "Candidat intéressant possédant un bon équilibre entre compétences techniques et relationnelles. Correspond bien à nos besoins actuels sur les projets secteur public. À faire rencontrer un directeur de mission pour validation."
      });
      setActiveTab('resultats');
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <HomeLayout>
      <div className="container py-8 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/amoa-mode-selection')}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-extrabold text-black dark:text-white flex items-center gap-2">
              <UserCircle className="h-8 w-8 text-emerald-500" />
              Synthèse d'Entretien IA
            </h1>
          </div>
          <p className="text-gray-700 dark:text-gray-300 max-w-3xl">
            Transformez vos notes de recrutement en synthèse d'entretien structurée. Collez simplement vos notes et notre IA générera une synthèse professionnelle prête à l'emploi.
          </p>
        </div>

        {/* Choix entre synthèse et simulation */}
        <Card className="mb-8 border-emerald-300 dark:border-emerald-800">
          <CardHeader className="bg-emerald-50 dark:bg-emerald-900/20 rounded-t-lg">
            <CardTitle className="text-xl text-emerald-800 dark:text-emerald-300">
              Bienvenue dans l'assistant de Synthèse d'Entretien
            </CardTitle>
            <CardDescription className="text-emerald-700 dark:text-emerald-400">
              Choisissez entre générer une synthèse à partir de vos notes ou simuler un entretien IA
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => setActiveTab('entretien')}
                variant={activeTab === 'entretien' ? 'default' : 'outline'}
                className={`h-auto py-4 justify-start ${activeTab === 'entretien' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                    <ClipboardCopy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold mb-1">Synthèse d'entretien</div>
                    <p className="text-sm text-muted-foreground text-left">
                      Collez vos notes d'entretien et obtenez une synthèse structurée
                    </p>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={() => navigate('/amoa/interview-simulation')}
                variant="outline"
                className="h-auto py-4 justify-start border-emerald-200 hover:border-emerald-300 dark:border-emerald-800"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <UserCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold mb-1">Simulation d'entretien</div>
                    <p className="text-sm text-muted-foreground text-left">
                      Lancez une simulation d'entretien IA de 10 minutes
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Onglets principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 w-full grid grid-cols-2">
            <TabsTrigger value="entretien" className="text-base py-3">
              Saisir les notes
            </TabsTrigger>
            <TabsTrigger 
              value="resultats" 
              className="text-base py-3"
              disabled={!synthese}
            >
              Résultats
            </TabsTrigger>
          </TabsList>

          {/* Onglet de saisie des notes */}
          <TabsContent value="entretien" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notes d'entretien</CardTitle>
                <CardDescription>
                  Collez vos notes prises pendant ou après l'entretien. Notre IA structurera automatiquement ces informations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Exemple: Diplômé Master MIAGE 2022. 1 an chez Accenture (dev Java/Angular). Actuellement chez Sopra depuis 6 mois. Bonne présentation, discours structuré. Intéressé par variété des missions. TOEIC 805. S'est bien renseigné sur mc2i..." 
                  className="min-h-[300px] p-4"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                />
                
                <Alert className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-300">Conseil</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Plus vos notes sont détaillées, meilleure sera la synthèse. Incluez des observations sur l'attitude, les motivations et les compétences techniques.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setInputNotes('')}
                  disabled={!inputNotes || isGenerating}
                >
                  Effacer
                </Button>
                <Button 
                  onClick={generateSynthese}
                  disabled={!inputNotes || isGenerating}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>Générer la synthèse</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Onglet des résultats */}
          <TabsContent value="resultats" className="space-y-6">
            {synthese ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Synthèse générée</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copySynthese}
                      className="flex items-center gap-2"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Copier
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={exportSynthese}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exporter
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md border-0 ring-1 ring-gray-200 dark:ring-gray-700">
                  {syntheseFields.map(field => (
                    <SyntheseField key={field.id} field={field} />
                  ))}
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setActiveTab('entretien');
                      setInputNotes('');
                      setSynthese(null);
                    }}
                  >
                    Nouvelle synthèse
                  </Button>
                  <Button 
                    onClick={() => navigate('/amoa-mode-selection')}
                    variant="default"
                  >
                    Terminer
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Aucune synthèse générée</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Veuillez d'abord saisir vos notes et générer une synthèse.
                </p>
                <Button 
                  onClick={() => setActiveTab('entretien')}
                  variant="outline"
                >
                  Retour à la saisie
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
}