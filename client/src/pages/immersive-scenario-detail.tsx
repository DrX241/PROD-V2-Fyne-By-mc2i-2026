import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, ChevronLeft, BuildingIcon, Users, Target, Clock, ShieldAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ImmersiveScenario, UserRole } from '@/types/immersive-cyber';
import { apiRequest } from '@/lib/queryClient';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImmersiveScenarioDetail() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/immersive-simulation/:id');
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);

  const { data: scenarioData, isLoading, error } = useQuery<{ success: boolean, scenario: ImmersiveScenario }>({
    queryKey: ['/api/immersive-simulation/scenarios', params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" onClick={() => setLocation('/immersive-simulation')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux scénarios
          </Button>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-36 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scenarioData?.success) {
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger ce scénario. Veuillez réessayer plus tard.",
      variant: "destructive",
    });
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Erreur de chargement</h2>
        <p className="mb-4">Le scénario demandé n'a pas pu être chargé.</p>
        <Button onClick={() => setLocation('/immersive-simulation')}>Retour aux scénarios</Button>
      </div>
    );
  }

  const scenario = scenarioData.scenario;

  const handleStartSession = async () => {
    if (!selectedRole) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un rôle pour continuer.",
        variant: "destructive",
      });
      return;
    }

    setIsStarting(true);
    
    try {
      const response = await apiRequest('/api/immersive-simulation/sessions', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId: scenario.id,
          userId: "user123", // Normalement, cela devrait être l'ID de l'utilisateur connecté
          selectedRole
        })
      });

      if (response.success && response.session) {
        toast({
          title: "Session démarrée",
          description: "Votre simulation va commencer.",
        });
        setLocation(`/immersive-simulation/session/${response.session.id}`);
      } else {
        throw new Error(response.message || "Échec du démarrage de la session");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Fonction pour traduire le rôle en français
  const translateRole = (role: UserRole): string => {
    const translations: Record<UserRole, string> = {
      RSSI: "Responsable de la sécurité des systèmes d'information",
      CrisisManager: "Gestionnaire de crise",
      CommunicationManager: "Responsable de communication",
      TechnicalLead: "Responsable technique",
      HumanResourcesManager: "Directeur des ressources humaines",
      LegalAdvisor: "Conseiller juridique",
      BusinessContinuityManager: "Responsable de la continuité d'activité"
    };
    return translations[role] || role;
  };

  // Fonction pour obtenir une description du rôle
  const getRoleDescription = (role: UserRole): string => {
    const descriptions: Record<UserRole, string> = {
      RSSI: "Vous êtes responsable de l'ensemble de la sécurité informatique et devez prendre les décisions stratégiques pour protéger les systèmes et les données.",
      CrisisManager: "Votre mission est de coordonner la réponse à la crise, d'organiser les équipes et de maintenir une vision globale de la situation.",
      CommunicationManager: "Vous gérez la communication interne et externe pendant la crise, en veillant à maintenir la confiance des parties prenantes.",
      TechnicalLead: "Vous dirigez les aspects techniques de la réponse à l'incident et mettez en œuvre les solutions de remédiation.",
      HumanResourcesManager: "Vous gérez les aspects humains de la crise et veillez au bien-être des employés tout en facilitant la communication interne.",
      LegalAdvisor: "Vous conseillez l'équipe sur les aspects juridiques et réglementaires de la gestion de crise et des obligations de notification.",
      BusinessContinuityManager: "Vous êtes chargé de maintenir les opérations critiques et de minimiser l'impact de la crise sur l'activité de l'entreprise."
    };
    return descriptions[role] || "Aucune description disponible pour ce rôle.";
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => setLocation('/immersive-simulation')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux scénarios
        </Button>
        <h1 className="text-3xl font-bold mb-2">{scenario.title}</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {scenario.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {scenario.sector}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description du scénario</CardTitle>
              <CardDescription>{scenario.companyProfile.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{scenario.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <BuildingIcon className="h-5 w-5 mr-2 mt-1 text-gray-500" />
                  <div>
                    <h4 className="font-medium">Profil de l'entreprise</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {scenario.companyProfile.size} • {scenario.companyProfile.employeeCount} employés
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CA: {scenario.companyProfile.revenue}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 mt-1 text-gray-500" />
                  <div>
                    <h4 className="font-medium">Cadre temporel</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.timeframe}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Situation initiale</h3>
                <p className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">{scenario.initialSituation}</p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="company-details">
                  <AccordionTrigger>Détails de l'entreprise</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Emplacements</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {scenario.companyProfile.locations.map((location, index) => (
                            <li key={index}>{location}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Systèmes critiques</h4>
                        <ul className="list-disc pl-5 text-sm">
                          {scenario.companyProfile.businessCriticalSystems.map((system, index) => (
                            <li key={index}>{system}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Obligations réglementaires</h4>
                        <div className="flex flex-wrap gap-2">
                          {scenario.companyProfile.regulatoryObligations.map((obligation, index) => (
                            <Badge key={index} variant="secondary">{obligation}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="infrastructure">
                  <AccordionTrigger>Infrastructure technique</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Services cloud</h4>
                        <div className="flex flex-wrap gap-2">
                          {scenario.companyProfile.infrastructure.cloudServices.map((service, index) => (
                            <Badge key={index} variant="outline">{service}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Systèmes on-premise</h4>
                        <div className="flex flex-wrap gap-2">
                          {scenario.companyProfile.infrastructure.onPremSystems.map((system, index) => (
                            <Badge key={index} variant="outline">{system}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Outils de sécurité</h4>
                        <div className="flex flex-wrap gap-2">
                          {scenario.companyProfile.infrastructure.securityTools.map((tool, index) => (
                            <Badge key={index} variant="outline">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Topologie réseau</h4>
                        <p className="text-sm">{scenario.companyProfile.infrastructure.networkTopology}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="learning-objectives">
                  <AccordionTrigger>Objectifs d'apprentissage</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5">
                      {scenario.learningObjectives.map((objective, index) => (
                        <li key={index} className="mb-2">{objective}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choisissez votre rôle</CardTitle>
              <CardDescription>
                Chaque rôle vous donne une perspective différente et des options spécifiques pour gérer la crise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedRole || ""} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                {scenario.availableRoles.map((role) => (
                  <div key={role} className="flex items-start space-x-2 mb-4">
                    <RadioGroupItem value={role} id={role} />
                    <div className="grid gap-1.5">
                      <Label htmlFor={role} className="font-medium">{translateRole(role)}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getRoleDescription(role)}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleStartSession} 
                disabled={!selectedRole || isStarting}
              >
                {isStarting ? "Démarrage en cours..." : "Commencer la simulation"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}