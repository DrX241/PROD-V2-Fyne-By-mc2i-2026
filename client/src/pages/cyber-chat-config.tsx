import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Settings, MessageSquare, Brain, HelpCircle, Info, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIConfigState {
  difficultyLevel: string;
  responseStyle: string;
  temperature: number;
  maxTokens: number;
}

export default function CyberChatConfig() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Charger la configuration depuis localStorage ou utiliser les valeurs par défaut
  const [config, setConfig] = useState<AIConfigState>(() => {
    const savedConfig = localStorage.getItem('cyberChatConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      }
    }
    return {
      difficultyLevel: 'Intermédiaire',
      responseStyle: 'Détaillé et pédagogique',
      temperature: 0.7,
      maxTokens: 800
    };
  });
  
  const handleDifficultyChange = (value: string) => {
    setConfig({
      ...config,
      difficultyLevel: value
    });
  };
  
  const handleStyleChange = (value: string) => {
    setConfig({
      ...config,
      responseStyle: value
    });
  };
  
  const handleTemperatureChange = (value: number[]) => {
    setConfig({
      ...config,
      temperature: value[0]
    });
  };
  
  const handleMaxTokensChange = (value: number[]) => {
    setConfig({
      ...config,
      maxTokens: value[0]
    });
  };
  
  const startChatSession = () => {
    // Sauvegarder la configuration dans localStorage
    localStorage.setItem('cyberChatConfig', JSON.stringify(config));
    
    // Rediriger vers la page du chat
    navigate('/cyber-new-chat');
    
    toast({
      title: "Configuration enregistrée",
      description: "Votre session I AM CYBER démarre avec les paramètres personnalisés.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">I AM CYBER</h1>
          <p className="text-gray-600 mt-2">Configurez votre expérience de chatbot en cybersécurité</p>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Paramètres du chatbot</CardTitle>
                <CardDescription>Personnalisez votre expérience d'apprentissage</CardDescription>
              </div>
              <Settings className="h-6 w-6 text-gray-400" />
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="basic" className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Configuration de base</TabsTrigger>
                <TabsTrigger value="advanced">Paramètres avancés</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Niveau de difficulté</h3>
                  <RadioGroup 
                    value={config.difficultyLevel} 
                    onValueChange={handleDifficultyChange}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Débutant" id="difficulty-beginner" />
                      <Label htmlFor="difficulty-beginner" className="cursor-pointer flex items-center">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        Débutant
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Intermédiaire" id="difficulty-intermediate" />
                      <Label htmlFor="difficulty-intermediate" className="cursor-pointer flex items-center">
                        <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        Intermédiaire
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Expert" id="difficulty-expert" />
                      <Label htmlFor="difficulty-expert" className="cursor-pointer flex items-center">
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        Expert
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-lg font-medium">Style de réponse</h3>
                  <RadioGroup 
                    value={config.responseStyle} 
                    onValueChange={handleStyleChange}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Détaillé et pédagogique" id="style-detailed" />
                      <Label htmlFor="style-detailed" className="cursor-pointer flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                        Détaillé et pédagogique
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Professionnel" id="style-professional" />
                      <Label htmlFor="style-professional" className="cursor-pointer flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-indigo-500" />
                        Professionnel
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Concis et direct" id="style-concise" />
                      <Label htmlFor="style-concise" className="cursor-pointer flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-purple-500" />
                        Concis et direct
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6 pt-4">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">Température</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 ml-1">
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Contrôle la créativité des réponses. Une valeur basse donne des réponses plus prévisibles, une valeur haute des réponses plus variées.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-sm text-gray-500 font-mono">{config.temperature.toFixed(2)}</span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.05}
                      value={[config.temperature]}
                      onValueChange={handleTemperatureChange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Précis</span>
                      <span>Équilibré</span>
                      <span>Créatif</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">Longueur des réponses</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 ml-1">
                                <HelpCircle className="h-4 w-4 text-gray-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Définit la longueur maximale des réponses. Plus cette valeur est élevée, plus les réponses peuvent être détaillées.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <span className="text-sm text-gray-500 font-mono">{config.maxTokens}</span>
                    </div>
                    <Slider
                      min={200}
                      max={1500}
                      step={50}
                      value={[config.maxTokens]}
                      onValueChange={handleMaxTokensChange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Court</span>
                      <span>Moyen</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Votre configuration sera appliquée à toutes vos interactions avec le chatbot de cybersécurité. Vous pourrez modifier ces paramètres à tout moment.
                </p>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Retour à l'accueil
                </Button>
                <Button onClick={startChatSession} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Brain className="mr-2 h-5 w-5" />
                  Démarrer la conversation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}