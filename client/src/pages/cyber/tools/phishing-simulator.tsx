import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, AlertTriangle, ChevronLeft, Copy, Check, AlertCircle, MessageSquare, List } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type PhishingTargetType = 'general' | 'executive' | 'it' | 'finance' | 'hr';
type PhishingTechniqueType = 'urgency' | 'curiosity' | 'fear' | 'reward' | 'authority' | 'social';
type PhishingComplexityType = 'basic' | 'intermediate' | 'advanced';

interface PhishingSimulationResult {
  emailSubject: string;
  emailBody: string;
  senderName: string;
  senderEmail: string;
  targetedVulnerabilities: string[];
  warningFlags: string[];
  educationalPoints: string[];
  difficultyLevel: number;
}

// Fonction pour nettoyer les tags HTML pouvant provenir de l'API
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};

// Exemples prédéfinis pour le simulateur
const phishingExamples = {
  urgency: {
    scenario: "Une entreprise e-commerce qui souhaite sensibiliser ses employés aux tentatives d'hameçonnage liées à la réinitialisation de mot de passe urgente.",
    context: "Contexte d'urgence avec demande immédiate d'action pour éviter une conséquence négative"
  },
  reward: {
    scenario: "Une banque qui veut former son personnel à identifier les emails frauduleux offrant des récompenses ou remboursements.",
    context: "Email promettant un gain, un cadeau ou une opportunité financière exceptionnelle"
  },
  authority: {
    scenario: "Un organisme gouvernemental souhaitant préparer ses employés à détecter les emails se faisant passer pour des figures d'autorité.",
    context: "Email qui semble provenir de la direction, des RH ou d'un organisme officiel demandant une action"
  }
};

export default function PhishingSimulator() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // États pour les entrées utilisateur
  const [scenario, setScenario] = useState('');
  const [targetType, setTargetType] = useState<PhishingTargetType>('general');
  const [technique, setTechnique] = useState<PhishingTechniqueType>('urgency');
  const [complexity, setComplexity] = useState<PhishingComplexityType>('intermediate');
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [includeBranding, setIncludeBranding] = useState(true);
  
  // État pour les résultats
  const [result, setResult] = useState<PhishingSimulationResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mutation pour la génération de l'email de phishing
  const generatePhishingMutation = useMutation({
    mutationFn: async (data: {
      scenario: string;
      targetType: PhishingTargetType;
      technique: PhishingTechniqueType;
      complexity: PhishingComplexityType;
      includeAttachments: boolean;
      includeBranding: boolean;
    }) => {
      return apiRequest('/api/cyber/tools/phishing-simulator', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data: PhishingSimulationResult) => {
      setResult(data);
      toast({
        title: 'Simulation générée',
        description: 'Votre email de phishing a été généré avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message,
      });
    },
  });

  // Gestion de la soumission du formulaire
  const handleSubmit = () => {
    if (!scenario.trim()) {
      toast({
        variant: 'destructive',
        title: 'Champ requis',
        description: 'Veuillez fournir un scénario pour la simulation.',
      });
      return;
    }

    generatePhishingMutation.mutate({
      scenario,
      targetType,
      technique,
      complexity,
      includeAttachments,
      includeBranding,
    });
  };

  // Gestion de la sélection d'exemples prédéfinis
  const handleExampleSelect = (exampleType: 'urgency' | 'reward' | 'authority') => {
    setScenario(phishingExamples[exampleType].scenario);
    setTechnique(exampleType);
  };

  // Fonction pour copier le texte dans le presse-papier
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedField(field);
        toast({
          title: 'Copié !',
          description: 'Le contenu a été copié dans le presse-papier',
        });
        setTimeout(() => setCopiedField(null), 2000);
      },
      (err) => {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de copier le texte'
        });
      }
    );
  };

  return (
    <HomeLayout>
      <PageTitle title="SIMULATEUR DE PHISHING" />
      
      <div className="container mx-auto py-6">
        <Card className="bg-gray-900 border-gray-800 text-gray-100 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Mail className="mr-2 h-6 w-6 text-blue-400" />
              Simulateur d'Emails de Phishing
            </CardTitle>
            <CardDescription className="text-gray-400">
              Créez des exemples d'emails de phishing pour former et sensibiliser votre équipe aux techniques d'ingénierie sociale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-start mb-6">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-950 border-blue-800"
                onClick={() => setLocation('/cyber')}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="scenario" className="text-gray-300 mb-2 block">
                  Scénario de simulation
                </Label>
                <div className="bg-gray-800 p-2 rounded-md mb-3">
                  <div className="flex justify-between mb-2">
                    <Label className="text-gray-400 text-sm">
                      Décrivez le contexte ou utilisez un exemple:
                    </Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 text-xs hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => handleExampleSelect('urgency')}
                      >
                        Urgence
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 text-xs hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => handleExampleSelect('reward')}
                      >
                        Récompense
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 text-xs hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => handleExampleSelect('authority')}
                      >
                        Autorité
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    id="scenario"
                    placeholder="Ex: Une entreprise technologique qui souhaite tester si ses employés peuvent identifier un email demandant de réinitialiser leur mot de passe..."
                    className="bg-gray-700 border-gray-600 min-h-[120px] text-gray-200"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="targetType" className="text-gray-300 mb-2 block">
                      Cible de l'attaque
                    </Label>
                    <Select value={targetType} onValueChange={(val: PhishingTargetType) => setTargetType(val)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue placeholder="Sélectionnez une cible" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="general">Employés (Général)</SelectItem>
                        <SelectItem value="executive">Dirigeants</SelectItem>
                        <SelectItem value="it">Équipe IT</SelectItem>
                        <SelectItem value="finance">Équipe finance</SelectItem>
                        <SelectItem value="hr">Ressources humaines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="technique" className="text-gray-300 mb-2 block">
                      Technique de manipulation
                    </Label>
                    <Select value={technique} onValueChange={(val: PhishingTechniqueType) => setTechnique(val)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue placeholder="Sélectionnez une technique" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="urgency">Urgence</SelectItem>
                        <SelectItem value="curiosity">Curiosité</SelectItem>
                        <SelectItem value="fear">Peur</SelectItem>
                        <SelectItem value="reward">Récompense</SelectItem>
                        <SelectItem value="authority">Autorité</SelectItem>
                        <SelectItem value="social">Pression sociale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div>
                    <Label htmlFor="complexity" className="text-gray-300 mb-2 block">
                      Niveau de complexité
                    </Label>
                    <Select value={complexity} onValueChange={(val: PhishingComplexityType) => setComplexity(val)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue placeholder="Sélectionnez un niveau" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="basic">Basique (Facile à détecter)</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé (Difficile à détecter)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeAttachments"
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      checked={includeAttachments}
                      onChange={(e) => setIncludeAttachments(e.target.checked)}
                    />
                    <Label htmlFor="includeAttachments" className="text-gray-300">
                      Inclure pièces jointes fictives
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeBranding"
                      className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      checked={includeBranding}
                      onChange={(e) => setIncludeBranding(e.target.checked)}
                    />
                    <Label htmlFor="includeBranding" className="text-gray-300">
                      Imiter l'image de marque
                    </Label>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmit}
                  disabled={generatePhishingMutation.isPending || !scenario.trim()}
                >
                  {generatePhishingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Générer l'email de phishing
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Résultat de la simulation
                </Label>
                <div className="bg-gray-800 rounded-md p-4 min-h-[500px]">
                  {generatePhishingMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-400" />
                      <p>Génération en cours...</p>
                      <p className="text-sm mt-2">Création de votre email de simulation</p>
                    </div>
                  ) : result ? (
                    <Tabs defaultValue="email">
                      <TabsList className="bg-gray-700">
                        <TabsTrigger value="email">Email généré</TabsTrigger>
                        <TabsTrigger value="analysis">Analyse éducative</TabsTrigger>
                      </TabsList>
                      <TabsContent value="email" className="mt-4">
                        <div className="bg-gray-700 rounded-md p-4 text-white">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Email de phishing simulé</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300"
                              onClick={() => copyToClipboard(`De: ${result.senderName} <${result.senderEmail}>\nObjet: ${result.emailSubject}\n\n${result.emailBody}`, 'email')}
                            >
                              {copiedField === 'email' ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="border border-gray-600 rounded-md mb-4">
                            <div className="border-b border-gray-600 p-3 bg-gray-800">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-semibold">De: {result.senderName} &lt;{result.senderEmail}&gt;</p>
                                  <p className="text-sm font-semibold mt-1">Objet: {result.emailSubject}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 whitespace-pre-wrap">
                              {stripHtml(result.emailBody)}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="analysis" className="mt-4">
                        <div className="bg-gray-700 rounded-md p-4 text-white">
                          <div className="mb-4">
                            <h3 className="text-blue-400 flex items-center mb-2">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Vulnérabilités ciblées
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {result.targetedVulnerabilities.map((point, index) => (
                                <li key={index} className="text-gray-200">{stripHtml(point)}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-4">
                            <h3 className="text-blue-400 flex items-center mb-2">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Signaux d'alerte
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {result.warningFlags.map((flag, index) => (
                                <li key={index} className="text-gray-200">{stripHtml(flag)}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-4">
                            <h3 className="text-blue-400 flex items-center mb-2">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Points éducatifs
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {result.educationalPoints.map((point, index) => (
                                <li key={index} className="text-gray-200">{stripHtml(point)}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-blue-400 mb-1">Niveau de difficulté</h3>
                            <div className="bg-gray-800 h-2 rounded-full">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-green-500 to-red-500"
                                style={{ width: `${(result.difficultyLevel / 10) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>Facile à détecter</span>
                              <span>Difficile à détecter</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Mail className="h-16 w-16 mb-4 text-gray-700" />
                      <p>Votre email de phishing simulé apparaîtra ici</p>
                      <p className="text-sm mt-2">Utilisez-le pour former votre équipe à reconnaître les tentatives d'hameçonnage</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-800 pt-4">
            <div className="text-sm text-gray-400">
              <p>Cet outil génère des emails de phishing pour la formation et la sensibilisation uniquement. N'utilisez jamais ces simulations à des fins malveillantes. Toutes les simulations sont générées par IA et sont conçues pour l'éducation.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </HomeLayout>
  );
}