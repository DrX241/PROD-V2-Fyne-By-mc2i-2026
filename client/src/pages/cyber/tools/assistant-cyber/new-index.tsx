import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  ChevronLeft,
  Bot,
  Wand2, 
  Settings, 
  Shield,
  Webhook,
  Zap,
  CheckCircle,
  Terminal,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  PanelRight,
  User,
  Code,
  BookMarked,
  Cloud
} from 'lucide-react';

import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import HomeLayout from '@/components/layout/HomeLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import PageTitle from '@/components/utils/PageTitle';

// Types pour l'assistant
interface AssistantPersonality {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface AssistantDomain {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function AssistantCyber() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("configuration");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationComplete, setGenerationComplete] = useState<boolean>(false);
  
  // État pour la configuration de l'assistant
  const [assistantName, setAssistantName] = useState<string>("");
  const [assistantDescription, setAssistantDescription] = useState<string>("");
  const [selectedPersonality, setSelectedPersonality] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  
  // Personnalités disponibles
  const personalities: AssistantPersonality[] = [
    {
      id: "expert",
      name: "Expert",
      description: "Un assistant formel qui fournit des informations précises et détaillées",
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: "coach",
      name: "Coach",
      description: "Un assistant encourageant qui guide et motive l'apprentissage",
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: "collaborateur",
      name: "Collaborateur",
      description: "Un assistant qui travaille comme un collègue et propose des solutions conjointement",
      icon: <User className="h-5 w-5" />
    },
    {
      id: "pedagogique",
      name: "Pédagogique",
      description: "Un assistant qui explique les concepts et simplifie la compréhension",
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];
  
  // Domaines de spécialisation
  const domains: AssistantDomain[] = [
    {
      id: "cloud-security",
      name: "Sécurité Cloud",
      description: "Spécialisé dans les enjeux de sécurité des environnements cloud et multi-cloud",
      icon: <Cloud className="h-5 w-5" />
    },
    {
      id: "network-security",
      name: "Sécurité Réseau",
      description: "Axé sur la protection des infrastructures réseau et la détection d'intrusion",
      icon: <Webhook className="h-5 w-5" />
    },
    {
      id: "app-security",
      name: "Sécurité Applicative",
      description: "Spécialisé dans le développement sécurisé et la protection des applications",
      icon: <Code className="h-5 w-5" />
    },
    {
      id: "security-governance",
      name: "Gouvernance",
      description: "Expert en réglementation, normes et bonnes pratiques de cybersécurité",
      icon: <BookMarked className="h-5 w-5" />
    },
    {
      id: "pentesting",
      name: "Test d'intrusion",
      description: "Spécialisé dans l'identification et l'exploitation des vulnérabilités",
      icon: <Terminal className="h-5 w-5" />
    }
  ];
  
  // Générer l'assistant
  const generateAssistant = () => {
    // Validation des champs requis
    if (!assistantName.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez donner un nom à votre assistant.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedDomain) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un domaine de spécialisation.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedPersonality) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner une personnalité pour votre assistant.",
        variant: "destructive"
      });
      return;
    }
    
    // Commencer la génération
    setIsGenerating(true);
    setGenerationProgress(0);
    setActiveTab("preview");
    
    // Simulation de la progression
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setGenerationProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setGenerationComplete(true);
        setIsGenerating(false);
        
        // Générer un exemple de prompt système
        const selectedPersonalityObj = personalities.find(p => p.id === selectedPersonality);
        const selectedDomainObj = domains.find(d => d.id === selectedDomain);
        
        const generatedSystemPrompt = `# Instructions système pour l'assistant "${assistantName}"

## Rôle et personnalité
Tu es un assistant IA spécialisé en cybersécurité avec une personnalité de type "${selectedPersonalityObj?.name}". ${getPersonalityDescription(selectedPersonality)}

## Domaine d'expertise
Ta spécialité est la ${selectedDomainObj?.name}. ${getDomainDescription(selectedDomain)}

## Objectifs
- Fournir des informations précises et à jour sur la cybersécurité
- Adapter tes explications au niveau technique de l'utilisateur
- Proposer des solutions pratiques et des recommandations applicables
- Rester neutre et objectif dans tes analyses

${isAdvanced && customInstructions ? `## Instructions personnalisées
${customInstructions}` : ''}

## Format des réponses
- Utilise des listes à puces pour énumérer les points importants
- Inclus des exemples concrets pour illustrer tes explications
- Structure tes réponses avec des titres et sous-titres quand approprié
- Cite tes sources quand tu fournis des informations techniques précises

## Limites
- Ne fournis jamais de conseils sur des activités illégales ou non éthiques
- Précise quand une information pourrait être obsolète ou nécessiter une vérification
- N'hésite pas à demander des clarifications si la question est ambiguë
`;
        
        setGeneratedPrompt(generatedSystemPrompt);
        
        // Notification de réussite
        toast({
          title: "Assistant généré avec succès",
          description: "Votre assistant personnalisé est prêt à être utilisé.",
          variant: "default"
        });
      }
    }, 100);
  };
  
  // Fonctions d'aide pour les descriptions
  const getPersonalityDescription = (personalityId: string): string => {
    switch (personalityId) {
      case "expert":
        return "Tu adoptes un ton formel et professionnel, en fournissant des informations précises et détaillées. Tu cites tes sources et contextes techniques quand c'est pertinent.";
      case "coach":
        return "Tu es encourageant et motivant, guidant l'utilisateur à travers son parcours d'apprentissage. Tu félicites ses progrès et l'encourages à poursuivre ses efforts.";
      case "collaborateur":
        return "Tu agis comme un collègue, proposant des idées et travaillant conjointement avec l'utilisateur pour résoudre les problèmes. Tu sollicites son avis et construis sur ses idées.";
      case "pedagogique":
        return "Tu expliques les concepts de façon claire et accessible, en utilisant des analogies et des exemples pour simplifier les notions complexes. Tu vérifies régulièrement la compréhension.";
      default:
        return "";
    }
  };
  
  const getDomainDescription = (domainId: string): string => {
    switch (domainId) {
      case "cloud-security":
        return "Tu connais en profondeur les enjeux de sécurité des environnements AWS, Azure, GCP et les architectures multi-cloud. Tu maîtrises les bonnes pratiques de configuration, de gestion des identités et des accès, et de protection des données dans le cloud.";
      case "network-security":
        return "Tu es spécialisé dans la protection des infrastructures réseau, la détection d'intrusion, les pare-feux et VPNs. Tu comprends les protocoles réseaux et leurs vulnérabilités.";
      case "app-security":
        return "Tu maîtrises les principes du développement sécurisé (SSDLC), les vulnérabilités OWASP Top 10, et les techniques de sécurisation des API et des applications web et mobiles.";
      case "security-governance":
        return "Tu es expert en normes et réglementations (ISO 27001, GDPR, NIS2, etc.), en gestion des risques, et en mise en place de politiques de sécurité et de programmes de conformité.";
      case "pentesting":
        return "Tu connais les méthodologies de test d'intrusion, les techniques d'exploitation de vulnérabilités, et les approches de red teaming. Tu sais expliquer comment identifier et corriger les faiblesses.";
      default:
        return "";
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      toast({
        title: "Copié dans le presse-papier",
        description: "Les instructions système ont été copiées avec succès.",
        variant: "default"
      });
    }).catch(err => {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papier.",
        variant: "destructive"
      });
    });
  };
  
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
        <PageTitle title="CRÉER VOTRE ASSISTANT CYBER" />
        
        <div className="container mx-auto py-6 pb-20">
          <Card className="bg-blue-900/20 border-blue-800 text-blue-100">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-rajdhani">Créer Votre Assistant Cyber</CardTitle>
                  <CardDescription className="text-blue-300">
                    Configurez un assistant IA personnalisé pour répondre à vos besoins spécifiques en cybersécurité
                  </CardDescription>
                </div>
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
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-2 mb-6 bg-blue-950/80">
                  <TabsTrigger value="configuration" disabled={isGenerating} className="data-[state=active]:bg-blue-700 data-[state=active]:text-white">Configuration</TabsTrigger>
                  <TabsTrigger value="preview" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white">Aperçu</TabsTrigger>
                </TabsList>
                
                <TabsContent value="configuration">
                  <div className="grid gap-6">
                    {/* Informations de base */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-rajdhani">Informations de base</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="assistant-name">Nom de l'assistant</Label>
                          <Input 
                            id="assistant-name" 
                            placeholder="Ex: CyberGuardian, SecurHelp..." 
                            value={assistantName}
                            onChange={(e) => setAssistantName(e.target.value)}
                            className="bg-blue-950/30 border-blue-700"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="assistant-domain">Domaine de spécialisation</Label>
                          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                            <SelectTrigger className="bg-blue-950/30 border-blue-700">
                              <SelectValue placeholder="Sélectionner un domaine" />
                            </SelectTrigger>
                            <SelectContent className="bg-blue-950 border-blue-800">
                              {domains.map((domain) => (
                                <SelectItem key={domain.id} value={domain.id} className="flex items-center">
                                  <div className="flex items-center">
                                    {domain.icon}
                                    <span className="ml-2">{domain.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="assistant-description">Description (optionnelle)</Label>
                        <Textarea 
                          id="assistant-description" 
                          placeholder="Décrivez brièvement le but de cet assistant..." 
                          value={assistantDescription}
                          onChange={(e) => setAssistantDescription(e.target.value)}
                          className="bg-blue-950/30 border-blue-700"
                        />
                      </div>
                    </div>
                    
                    {/* Personnalité */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-rajdhani">Personnalité</h3>
                      <p className="text-blue-300">Comment voulez-vous que votre assistant interagisse avec vous?</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {personalities.map((personality) => (
                          <div
                            key={personality.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedPersonality === personality.id 
                                ? 'bg-blue-900/30 border-blue-600' 
                                : 'bg-blue-950/30 border-blue-800 hover:border-blue-700'
                            }`}
                            onClick={() => setSelectedPersonality(personality.id)}
                          >
                            <div className="flex flex-col items-center text-center">
                              <div className={`p-3 rounded-full mb-3 ${
                                selectedPersonality === personality.id 
                                  ? 'bg-blue-700/50' 
                                  : 'bg-blue-900/30'
                              }`}>
                                {personality.icon}
                              </div>
                              <h4 className="text-lg font-medium">{personality.name}</h4>
                              <p className="text-sm text-blue-300 mt-1">{personality.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Options avancées */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold font-rajdhani">Options avancées</h3>
                          <p className="text-sm text-blue-300">Personnalisation additionnelle de l'assistant</p>
                        </div>
                        <Switch 
                          checked={isAdvanced} 
                          onCheckedChange={setIsAdvanced}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                      
                      {isAdvanced && (
                        <div className="pl-4 border-l-2 border-blue-800 space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="custom-instructions">Instructions personnalisées</Label>
                            <Textarea 
                              id="custom-instructions" 
                              placeholder="Ajoutez des instructions spécifiques pour votre assistant..." 
                              value={customInstructions}
                              onChange={(e) => setCustomInstructions(e.target.value)}
                              className="bg-blue-950/30 border-blue-700 min-h-[150px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end mt-6">
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                        onClick={generateAssistant}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Générer l'assistant
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview">
                  {isGenerating ? (
                    <div className="space-y-6 py-4">
                      <h3 className="text-xl font-semibold font-rajdhani text-center">Génération de votre assistant en cours...</h3>
                      <Progress value={generationProgress} className="h-2 bg-blue-950 w-full" indicatorClassName="bg-blue-500" />
                      <div className="flex flex-col items-center justify-center gap-4 mt-8">
                        <div className="flex items-start gap-3">
                          <Bot className="h-6 w-6 text-blue-400 mt-1" />
                          <div>
                            <p className="font-medium">Personnalisation du modèle...</p>
                            <p className="text-sm text-blue-300 mt-1">Configuration des paramètres de base</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Settings className="h-6 w-6 text-blue-400 mt-1" />
                          <div>
                            <p className="font-medium">Création des instructions système...</p>
                            <p className="text-sm text-blue-300 mt-1">Intégration des connaissances spécifiques</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-6 w-6 text-blue-400 mt-1" />
                          <div>
                            <p className="font-medium">Finalisation de la personnalité...</p>
                            <p className="text-sm text-blue-300 mt-1">Ajustement du ton et du style de communication</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : generationComplete ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold font-rajdhani">Instructions système générées</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-400 hover:text-blue-300 border-blue-800 hover:bg-blue-900"
                          onClick={copyToClipboard}
                        >
                          Copier
                        </Button>
                      </div>
                      
                      <div className="bg-blue-950/50 p-4 rounded-md border border-blue-800 overflow-auto">
                        <pre className="text-sm text-blue-100 whitespace-pre-wrap font-mono">
                          {generatedPrompt}
                        </pre>
                      </div>
                      
                      <div className="bg-blue-900/20 p-4 rounded-md border border-blue-800">
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-2 font-rajdhani">
                          <CheckCircle className="h-5 w-5 text-green-400" />
                          Assistant prêt à l'emploi
                        </h4>
                        <p className="text-blue-200 mb-4">
                          Votre assistant IA spécialisé en cybersécurité a été configuré avec succès selon vos spécifications.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                            onClick={() => setLocation('/cyber')}
                          >
                            Retourner à I AM CYBER
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PanelRight className="h-16 w-16 text-blue-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold font-rajdhani mb-2">Aperçu non disponible</h3>
                      <p className="text-blue-300 max-w-md mx-auto">
                        Configurez votre assistant et cliquez sur "Générer l'assistant" pour voir l'aperçu des instructions système.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-6 border-blue-700 text-blue-300 hover:bg-blue-900/50"
                        onClick={() => setActiveTab("configuration")}
                      >
                        Retour à la configuration
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </HomeLayout>
  );
}