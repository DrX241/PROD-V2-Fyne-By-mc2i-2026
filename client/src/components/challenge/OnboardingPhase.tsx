import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlayerRole } from '@shared/types/challenge';
import { Check, Shield, Code, FileText, Scale, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OnboardingPhaseProps {
  onComplete: () => void;
}

export default function OnboardingPhase({ onComplete }: OnboardingPhaseProps) {
  const { createGame, addPlayer, isLoading, error } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);
  const [step, setStep] = useState<'welcome' | 'createGame' | 'addPlayer'>('welcome');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateGame = async () => {
    setErrorMessage(null);
    try {
      await createGame(1); // Single-player mode for now
      setStep('addPlayer');
    } catch (error) {
      setErrorMessage('Erreur lors de la création du jeu. Veuillez réessayer.');
      console.error(error);
    }
  };

  const handleAddPlayer = async () => {
    if (!playerName.trim()) {
      setErrorMessage('Veuillez entrer votre nom.');
      return;
    }
    
    if (!selectedRole) {
      setErrorMessage('Veuillez sélectionner un rôle.');
      return;
    }
    
    setErrorMessage(null);
    
    try {
      await addPlayer(playerName, selectedRole);
      onComplete();
    } catch (error) {
      setErrorMessage('Erreur lors de l\'ajout du joueur. Veuillez réessayer.');
      console.error(error);
    }
  };

  const roleDescriptions = {
    [PlayerRole.RSSI]: 'Responsable de la stratégie de sécurité et de la conformité',
    [PlayerRole.ETHICAL_HACKER]: 'Expert en tests d\'intrusion et identification des vulnérabilités',
    [PlayerRole.DEVELOPER]: 'Spécialiste en développement sécurisé',
    [PlayerRole.CONSULTANT]: 'Expert en conseil et audit de sécurité',
    [PlayerRole.LEGAL_EXPERT]: 'Spécialiste des aspects légaux et réglementaires'
  };

  const roleIcons = {
    [PlayerRole.RSSI]: <Shield className="h-6 w-6" />,
    [PlayerRole.ETHICAL_HACKER]: <AlertTriangle className="h-6 w-6" />,
    [PlayerRole.DEVELOPER]: <Code className="h-6 w-6" />,
    [PlayerRole.CONSULTANT]: <FileText className="h-6 w-6" />,
    [PlayerRole.LEGAL_EXPERT]: <Scale className="h-6 w-6" />
  };

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Bienvenue dans CyberChallenge</h2>
        <p className="text-muted-foreground mt-2">
          Testez vos compétences en cybersécurité dans une simulation de gestion de crise réaliste
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Scénarios réalistes</h3>
            <p className="text-sm text-muted-foreground">Faites face à des incidents inspirés de cas réels</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Prise de décision sous pression</h3>
            <p className="text-sm text-muted-foreground">Gérez votre budget et votre temps pour résoudre la crise</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Interaction avec l'équipe</h3>
            <p className="text-sm text-muted-foreground">Communiquez avec différentes parties prenantes</p>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full mt-6" 
        onClick={() => setStep('createGame')}
        disabled={isLoading}
      >
        Commencer
      </Button>
    </div>
  );

  const renderCreateGameStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Créer une nouvelle simulation</h2>
        <p className="text-muted-foreground mt-2">
          Configurez votre session de gestion de crise
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mode Solo</CardTitle>
          <CardDescription>
            Affrontez la crise seul avec l'assistance d'une équipe virtuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            En mode solo, vous êtes le principal décideur dans la gestion de crise. 
            Vous interagirez avec différents membres de l'équipe dirigeante et 
            devrez prendre les décisions critiques.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleCreateGame}
            disabled={isLoading}
          >
            {isLoading ? 'Création en cours...' : 'Créer une simulation en mode solo'}
          </Button>
        </CardFooter>
      </Card>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => setStep('welcome')}
        disabled={isLoading}
      >
        Retour
      </Button>
    </div>
  );

  const renderAddPlayerStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Choisissez votre rôle</h2>
        <p className="text-muted-foreground mt-2">
          Sélectionnez le rôle que vous souhaitez jouer dans cette simulation
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="playerName">Votre nom</Label>
          <Input
            id="playerName"
            placeholder="Entrez votre nom"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label>Choisissez votre rôle</Label>
          <RadioGroup 
            value={selectedRole || ''} 
            onValueChange={(value) => setSelectedRole(value as PlayerRole)}
          >
            {Object.values(PlayerRole).map((role) => (
              <div key={role} className="flex items-center space-x-2 space-y-1">
                <RadioGroupItem value={role} id={role} />
                <div className="flex flex-1 items-center space-x-2">
                  <Label 
                    htmlFor={role}
                    className="flex items-center p-2 cursor-pointer rounded hover:bg-muted transition-colors"
                  >
                    <div className="mr-2 text-primary">
                      {roleIcons[role]}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{role}</div>
                      <div className="text-sm text-muted-foreground">{roleDescriptions[role]}</div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setStep('createGame')}
          disabled={isLoading}
        >
          Retour
        </Button>
        <Button
          className="flex-1"
          onClick={handleAddPlayer}
          disabled={isLoading || !playerName || !selectedRole}
        >
          {isLoading ? 'Chargement...' : 'Continuer'}
        </Button>
      </div>
    </div>
  );

  switch (step) {
    case 'welcome':
      return renderWelcomeStep();
    case 'createGame':
      return renderCreateGameStep();
    case 'addPlayer':
      return renderAddPlayerStep();
    default:
      return renderWelcomeStep();
  }
}