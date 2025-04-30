import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScenarioType, UrgencyLevel } from '@shared/types/challenge';
import { AlertCircle, Clock, Briefcase, Building, Shield, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScenarioPhaseProps {
  onComplete: () => void;
}

export default function ScenarioPhase({ onComplete }: ScenarioPhaseProps) {
  const { configureScenario, state, startGame, isLoading, error } = useGame();
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [scenarioType, setScenarioType] = useState<string>(ScenarioType.RANSOMWARE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfigureScenario = async () => {
    setErrorMessage(null);
    try {
      await configureScenario(difficultyLevel as 'easy' | 'medium' | 'hard', scenarioType as ScenarioType);
      await startGame();
      onComplete();
    } catch (error) {
      setErrorMessage('Erreur lors de la configuration du scénario. Veuillez réessayer.');
      console.error(error);
    }
  };

  const scenarioTypeDescriptions = {
    [ScenarioType.RANSOMWARE]: 'Faites face à une attaque par rançongiciel qui a chiffré des systèmes critiques',
    [ScenarioType.DATA_BREACH]: 'Gérez une violation de données impliquant des informations sensibles',
    [ScenarioType.PHISHING]: 'Répondez à une campagne de phishing sophistiquée ciblant les employés',
    [ScenarioType.MALWARE]: 'Combattez une infection par logiciel malveillant qui s\'est propagée dans le réseau',
    [ScenarioType.INSIDER_THREAT]: 'Enquêtez sur une menace interne potentielle avec accès privilégié',
    [ScenarioType.SUPPLY_CHAIN]: 'Gérez une attaque via la chaîne d\'approvisionnement affectant vos fournisseurs'
  };

  const scenarioTypeIcons = {
    [ScenarioType.RANSOMWARE]: <AlertCircle className="h-6 w-6" />,
    [ScenarioType.DATA_BREACH]: <AlertTriangle className="h-6 w-6" />,
    [ScenarioType.PHISHING]: <Clock className="h-6 w-6" />,
    [ScenarioType.MALWARE]: <Briefcase className="h-6 w-6" />,
    [ScenarioType.INSIDER_THREAT]: <Building className="h-6 w-6" />,
    [ScenarioType.SUPPLY_CHAIN]: <Shield className="h-6 w-6" />
  };

  const difficultyDescriptions = {
    easy: 'Pour débutants : incidents simples et plus de temps pour les décisions',
    medium: 'Pour intermédiaires : incidents réalistes avec contraintes modérées',
    hard: 'Pour experts : incidents complexes avec fortes pressions et contraintes serrées'
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Configuration du scénario</h2>
        <p className="text-muted-foreground mt-2">
          Personnalisez votre simulation de gestion de crise
        </p>
      </div>
      
      <Tabs defaultValue="scenario" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenario">Type de scénario</TabsTrigger>
          <TabsTrigger value="difficulty">Niveau de difficulté</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scenario" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Choisissez le type d'incident de cybersécurité auquel vous souhaitez faire face
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(ScenarioType).map((type) => (
              <Card 
                key={type}
                className={`cursor-pointer transition-all ${scenarioType === type ? 'border-primary' : ''}`}
                onClick={() => setScenarioType(type)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-primary">
                      {scenarioTypeIcons[type]}
                    </div>
                    <CardTitle className="text-lg">{type}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">
                    {scenarioTypeDescriptions[type]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="difficulty" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Sélectionnez le niveau de difficulté de la simulation
          </p>
          
          <div className="space-y-4">
            <Card 
              className={`cursor-pointer transition-all ${difficultyLevel === 'easy' ? 'border-primary' : ''}`}
              onClick={() => setDifficultyLevel('easy')}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Débutant</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{difficultyDescriptions.easy}</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all ${difficultyLevel === 'medium' ? 'border-primary' : ''}`}
              onClick={() => setDifficultyLevel('medium')}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Intermédiaire</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{difficultyDescriptions.medium}</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all ${difficultyLevel === 'hard' ? 'border-primary' : ''}`}
              onClick={() => setDifficultyLevel('hard')}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Expert</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{difficultyDescriptions.hard}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {state.scenario && state.scenario.title && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Aperçu du scénario</CardTitle>
            <CardDescription>Détails de la simulation configurée</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Titre:</span>
                <span className="font-medium">{state.scenario.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">{state.scenario.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difficulté:</span>
                <span className="font-medium">{state.scenario.difficultyLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget initial:</span>
                <span className="font-medium">{state.scenario.initialBudget.toLocaleString()} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Urgence:</span>
                <span className="font-medium">{state.scenario.urgencyLevel || UrgencyLevel.MEDIUM}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}
      
      <div className="flex gap-4 mt-6">
        <Button 
          className="flex-1" 
          onClick={handleConfigureScenario}
          disabled={isLoading}
        >
          {isLoading ? 'Configuration en cours...' : 'Lancer la simulation'}
        </Button>
      </div>
    </div>
  );
}