import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GameProvider } from '@/contexts/GameContext';
import OnboardingPhase from '@/components/challenge/OnboardingPhase';
import ScenarioPhase from '@/components/challenge/ScenarioPhase';
import GameplayPhase from '@/components/challenge/GameplayPhase';
import ResultsPhase from '@/components/challenge/ResultsPhase';

enum GamePhase {
  ONBOARDING = 'onboarding',
  SCENARIO = 'scenario',
  GAMEPLAY = 'gameplay',
  RESULTS = 'results'
}

export default function CyberChallengePage() {
  const [currentPhase, setCurrentPhase] = useState<GamePhase>(GamePhase.ONBOARDING);
  
  const goToNextPhase = () => {
    switch (currentPhase) {
      case GamePhase.ONBOARDING:
        setCurrentPhase(GamePhase.SCENARIO);
        break;
      case GamePhase.SCENARIO:
        setCurrentPhase(GamePhase.GAMEPLAY);
        break;
      case GamePhase.GAMEPLAY:
        setCurrentPhase(GamePhase.RESULTS);
        break;
      case GamePhase.RESULTS:
        // Reset to start a new game
        setCurrentPhase(GamePhase.ONBOARDING);
        break;
    }
  };
  
  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case GamePhase.ONBOARDING:
        return <OnboardingPhase onComplete={goToNextPhase} />;
      case GamePhase.SCENARIO:
        return <ScenarioPhase onComplete={goToNextPhase} />;
      case GamePhase.GAMEPLAY:
        return <GameplayPhase onComplete={goToNextPhase} />;
      case GamePhase.RESULTS:
        return <ResultsPhase onComplete={goToNextPhase} />;
      default:
        return <OnboardingPhase onComplete={goToNextPhase} />;
    }
  };
  
  return (
    <GameProvider>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">CyberChallenge</h1>
          <Link href="/">
            <Button variant="outline" className="ml-auto">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Simulation de crise cybersécurité</CardTitle>
              <CardDescription>
                Rejoignez une équipe de gestion de crise et faites face à des incidents de sécurité réalistes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderCurrentPhase()}
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-muted-foreground">
                Phase: {currentPhase}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </GameProvider>
  );
}