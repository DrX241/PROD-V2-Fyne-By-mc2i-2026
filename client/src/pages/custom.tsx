import React, { useState } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Plus, CircleUser, Trash2, Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Header from '@/components/layout/Header';

interface CustomScenarioActor {
  name: string;
  role: string;
}

interface CustomScenarioStep {
  id: string;
  type: string;
  actor?: CustomScenarioActor;
  content?: string;
  expectations?: string[];
  nextStep?: string;
}

interface CustomScenario {
  id: string;
  name: string;
  description: string;
  domain: string;
  difficulty: "debutant" | "intermediaire" | "expert";
  isPublic: boolean;
  originalDescription: string;
  createdAt: Date;
  steps: CustomScenarioStep[];
}

export default function CustomScenariosPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: scenarios, isLoading, error } = useQuery<CustomScenario[]>({
    queryKey: ['/api/custom-scenarios'],
    retry: 1
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/custom-scenarios/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-scenarios'] });
      toast({
        title: 'Scénario supprimé',
        description: 'Le scénario a été supprimé avec succès.',
        variant: 'default'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le scénario.',
        variant: 'destructive'
      });
    }
  });
  
  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce scénario ?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Fonction utilitaire pour formater la date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Fonction pour obtenir la couleur de la difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'debutant':
        return 'bg-green-500';
      case 'intermediaire':
        return 'bg-amber-500';
      case 'expert':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Fonction pour obtenir le libellé de la difficulté
  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'debutant':
        return 'Débutant';
      case 'intermediaire':
        return 'Intermédiaire';
      case 'expert':
        return 'Expert';
      default:
        return difficulty;
    }
  };
  
  // Fonction pour obtenir le libellé du domaine
  const getDomainLabel = (domain: string) => {
    switch (domain) {
      case 'gestion-crise':
        return 'Gestion de crise cyber';
      case 'rgpd':
        return 'Protection des données personnelles/RGPD';
      case 'phishing':
        return 'Ingénierie sociale et phishing';
      case 'incidents':
        return 'Gestion des incidents de sécurité';
      case 'supply-chain':
        return 'Sécurité de la chaîne d\'approvisionnement';
      case 'gouvernance':
        return 'Stratégie et gouvernance cybersécurité';
      default:
        return domain;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header isFeny={true} />
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* En-tête de page */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Soyez qui vous voulez</h1>
              <p className="text-slate-600 mt-2">
                Explorez et jouez des scénarios personnalisés créés par notre IA ou d'autres utilisateurs.
              </p>
            </div>
            <Link href="/admin/scenarios">
              <Button className="mt-4 md:mt-0 gap-2">
                <Plus className="h-4 w-4" />
                Créer un scénario
              </Button>
            </Link>
          </div>
          
          {/* Grille de scénarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeleton loader
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="bg-gray-100 h-32"></CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded mb-2 w-full"></div>
                    <div className="h-3 bg-gray-100 rounded mb-2 w-5/6"></div>
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              // Affichage d'erreur
              <div className="col-span-full flex justify-center items-center p-8 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">
                  Une erreur s'est produite lors du chargement des scénarios. Veuillez réessayer plus tard.
                </p>
              </div>
            ) : scenarios && scenarios.length > 0 ? (
              // Affichage des scénarios
              scenarios.map((scenario) => (
                <Card key={scenario.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="pb-4 bg-gradient-to-br from-indigo-50 to-blue-50">
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        <span className={`text-xs text-white px-2 py-1 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                          {getDifficultyLabel(scenario.difficulty)}
                        </span>
                        {scenario.isPublic ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Public
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Privé
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(scenario.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">{scenario.name}</CardTitle>
                    <CardDescription>
                      {getDomainLabel(scenario.domain)}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {scenario.description}
                    </p>
                    
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <CircleUser className="h-3.5 w-3.5 mr-1" />
                      {scenario.steps.length > 0 && scenario.steps[0].actor ? (
                        <span>{scenario.steps[0].actor.name}, {scenario.steps[0].actor.role}</span>
                      ) : (
                        <span>Interlocuteur non défini</span>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 pb-4 border-t flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      Créé le {formatDate(scenario.createdAt)}
                    </span>
                    <Button size="sm" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Démarrer
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              // Aucun scénario trouvé
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-lg">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <Plus className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Aucun scénario personnalisé</h3>
                <p className="text-gray-500 text-center mb-4">
                  Vous n'avez pas encore créé de scénario personnalisé.
                </p>
                <Link href="/admin/scenarios">
                  <Button>Créer mon premier scénario</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}