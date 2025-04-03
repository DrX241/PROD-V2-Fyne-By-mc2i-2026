import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  BookType, 
  BriefcaseBusiness, 
  Clock, 
  Users, 
  Sparkles 
} from 'lucide-react';
import { amoaScenarios } from '../data/amoa-scenarios';
import { useAmoaContext } from '../contexts/AmoaContext';
import { AmoaScenario } from '../../shared/types/amoa';

export default function Amoa() {
  const { userName, setUserName, userRole, setUserRole, setCurrentScenario, setMessages } = useAmoaContext();
  const [_, setLocation] = useLocation();
  const [name, setName] = useState<string>(userName || '');
  const [role, setRole] = useState<string>(userRole || '');
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(!!userName && !!userRole);
  const [selectedScenario, setSelectedScenario] = useState<AmoaScenario | null>(null);

  // Si le profil est déjà complet, montrer directement les scénarios
  useEffect(() => {
    setIsProfileComplete(!!userName && !!userRole);
  }, [userName, userRole]);

  const handleSaveProfile = () => {
    if (name.trim() && role.trim()) {
      setUserName(name);
      setUserRole(role);
      setIsProfileComplete(true);
    }
  };

  const handleStartScenario = (scenario: AmoaScenario) => {
    setSelectedScenario(scenario);
    setCurrentScenario(scenario);
    setMessages([]);  // Reset messages when starting new scenario
    setLocation('/amoa-mission');
  };

  const renderProfile = () => (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Créez votre profil AMOA</CardTitle>
        <CardDescription>
          Pour commencer votre simulation en tant qu'Assistant à Maîtrise d'Ouvrage, veuillez créer votre profil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Votre nom</Label>
          <Input 
            id="name" 
            placeholder="Entrez votre nom" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Votre rôle</Label>
          <Input 
            id="role" 
            placeholder="Ex: AMOA Junior, Consultant AMOA, etc." 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSaveProfile}
          disabled={!name.trim() || !role.trim()}
        >
          Continuer
        </Button>
      </CardFooter>
    </Card>
  );

  const renderScenariosList = () => (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Bienvenue, {userName}</h1>
        <p className="text-gray-600">
          Sélectionnez un scénario pour commencer votre simulation en tant qu'Assistant à Maîtrise d'Ouvrage.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {amoaScenarios.map((scenario) => (
          <Card key={scenario.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{scenario.title}</CardTitle>
                <Badge 
                  variant="outline"
                  className={`
                    ${scenario.difficulty === 'Débutant' ? 'bg-green-50 border-green-200 text-green-700' : 
                      scenario.difficulty === 'Intermédiaire' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                      'bg-red-50 border-red-200 text-red-700'}
                  `}
                >
                  {scenario.difficulty}
                </Badge>
              </div>
              <CardDescription>{scenario.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <BriefcaseBusiness className="h-4 w-4 mr-2" />
                  <span className="font-medium">Domaine:</span>
                  <Badge variant="secondary" className="ml-2">
                    {scenario.businessDomain}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Durée estimée: {scenario.duration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Parties prenantes: {scenario.stakeholders.length}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>Documents: {scenario.documents.length}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>Compétences requises:</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {scenario.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleStartScenario(scenario)}
              >
                Démarrer ce scénario
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {!isProfileComplete ? renderProfile() : renderScenariosList()}
    </div>
  );
}