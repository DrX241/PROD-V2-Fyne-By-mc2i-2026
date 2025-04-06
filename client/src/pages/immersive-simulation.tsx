import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Clock, Building, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { ImmersiveScenario } from '@/types/immersive-cyber';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImmersiveSimulation() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Récupération des scénarios immersifs disponibles
  const { data: scenarios, isLoading, error } = useQuery<{ success: boolean, scenarios: ImmersiveScenario[] }>({
    queryKey: ['/api/immersive-simulation/scenarios'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Scénarios immersifs</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger les scénarios immersifs. Veuillez réessayer plus tard.",
      variant: "destructive",
    });
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Erreur de chargement</h2>
        <p className="mb-4">Impossible de charger les scénarios immersifs.</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  const handleStartScenario = (scenarioId: string) => {
    setLocation(`/immersive-simulation/${scenarioId}`);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-3">Scénarios de cyberdéfense immersifs</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Vivez des expériences immersives et interactives où vos décisions façonnent le déroulement de la crise. 
          Choisissez votre rôle, interagissez avec des personnages virtuels et mesurez l'impact de vos actions.
        </p>
        <Separator className="my-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios?.scenarios.map((scenario) => (
          <Card key={scenario.id} className="border shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{scenario.title}</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {scenario.difficulty}
                </Badge>
              </div>
              <CardDescription>{scenario.companyProfile.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 line-clamp-3">{scenario.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="flex items-center text-sm">
                  <Building className="mr-1 h-4 w-4" />
                  <span>{scenario.sector}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="mr-1 h-4 w-4" />
                  <span>{scenario.availableRoles.length} rôles</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Objectifs d'apprentissage :</h4>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {scenario.learningObjectives.slice(0, 2).map((objective, index) => (
                    <li key={index} className="line-clamp-1">{objective}</li>
                  ))}
                  {scenario.learningObjectives.length > 2 && (
                    <li className="text-gray-500">+ {scenario.learningObjectives.length - 2} autres</li>
                  )}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleStartScenario(scenario.id)} 
                className="w-full"
              >
                Démarrer le scénario
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {scenarios?.scenarios.length === 0 && (
        <div className="text-center py-12">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucun scénario disponible</h3>
          <p className="text-gray-500">De nouveaux scénarios seront bientôt disponibles.</p>
        </div>
      )}
    </div>
  );
}