import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { CheckIcon, Trash2Icon, GitMergeIcon, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import AdminPageTitle from '@/components/layout/AdminPageTitle';
import { useTheme } from '@/components/theme-provider';
import { getDomainLabel } from '@/lib/domainUtils';

interface DuplicateAssistant {
  id: number;
  type: 'template' | 'custom';
  name: string;
  description: string | null;
  domain: string;
  similarity: number;
  createdAt: string | null;
}

export default function AssistantDuplicatesPage() {
  const { toast } = useToast();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const [threshold, setThreshold] = useState(0.8);
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});

  // Requête pour récupérer les doublons
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['assistantDuplicates', threshold],
    queryFn: async () => {
      const response = await axios.get(`/api/assistants/duplicates/detect?threshold=${threshold}`);
      return response.data;
    }
  });

  // Fonction pour fusionner deux modèles
  const mergeTemplates = async (templateId1: number, templateId2: number, groupIndex: number) => {
    const key = `merge-${templateId1}-${templateId2}`;
    setProcessing(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await axios.post('/api/assistants/duplicates/merge', {
        templateId1,
        templateId2
      }, {
        headers: {
          'X-User-Role': 'admin' // Pour l'autorisation
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Fusion réussie",
          description: `Les modèles ont été fusionnés avec succès.`,
          variant: "default",
        });
        
        refetch(); // Actualiser la liste des doublons
      } else {
        toast({
          title: "Erreur de fusion",
          description: response.data.error || "Une erreur est survenue lors de la fusion des modèles.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la fusion:', error);
      toast({
        title: "Erreur de fusion",
        description: "Une erreur est survenue lors de la fusion des modèles.",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  // Fonction pour supprimer un modèle
  const deleteTemplate = async (templateId: number) => {
    const key = `delete-${templateId}`;
    setProcessing(prev => ({ ...prev, [key]: true }));
    
    try {
      const response = await axios.delete(`/api/assistants/templates/${templateId}`, {
        headers: {
          'X-User-Role': 'admin' // Pour l'autorisation
        }
      });
      
      if (response.data.success) {
        toast({
          title: "Suppression réussie",
          description: `Le modèle a été supprimé avec succès.`,
          variant: "default",
        });
        
        refetch(); // Actualiser la liste des doublons
      } else {
        toast({
          title: "Erreur de suppression",
          description: response.data.error || "Une erreur est survenue lors de la suppression du modèle.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur de suppression",
        description: "Une erreur est survenue lors de la suppression du modèle.",
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [key]: false }));
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Date inconnue";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fonction pour obtenir la couleur du badge de similarité
  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity >= 0.9) return "bg-green-100 text-green-800";
    if (similarity >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  // Fonction pour obtenir le libellé du domaine
  const getDomainLabel = (domain: string) => {
    const domainMap: Record<string, string> = {
      cybersecurite: 'Cybersécurité',
      gestion_projet: 'Gestion de projet',
      amoa: 'AMOA',
      developpement: 'Développement',
      data_ia: 'Data & IA',
      conseil: 'Conseil',
      general: 'Général',
    };
    
    return domainMap[domain] || 'Général';
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Gestion des doublons" 
          description="Détectez et éliminez les modèles d'assistants dupliqués"
          icon={<GitMergeIcon className="h-6 w-6 text-violet-500" />}
        />

        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Détection des doublons</h2>
            <p className="text-sm text-gray-500">
              Seuil de similarité: {threshold * 100}% - Ajustez ce seuil pour affiner la détection
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        <div>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>50% (Similarité faible)</span>
            <span>75% (Modérée)</span>
            <span>100% (Identiques)</span>
          </div>
        </div>

        <Separator className="my-6" />

        {isLoading ? (
          <div className="py-12 text-center">
            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-violet-500 mb-4" />
            <h3 className="text-lg font-medium">Détection des doublons en cours...</h3>
            <p className="text-sm text-gray-500 mt-2">
              Cette opération peut prendre quelques instants selon le nombre de modèles
            </p>
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors de la détection des doublons. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        ) : data?.duplicateGroups?.length === 0 ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckIcon className="h-4 w-4 text-green-600" />
            <AlertTitle>Aucun doublon détecté</AlertTitle>
            <AlertDescription>
              Tous les modèles d'assistants sont uniques avec le seuil de similarité actuel.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {data?.totalDuplicates} doublon(s) détecté(s) dans {data?.duplicateGroups?.length} groupe(s)
              </h2>
            </div>

            {data?.duplicateGroups?.map((group: DuplicateAssistant[], groupIndex: number) => (
              <Card key={groupIndex} className={`overflow-hidden border-l-4 ${isFuturistic ? 'bg-gray-800 border-violet-500' : 'border-l-violet-500'}`}>
                <CardHeader>
                  <CardTitle>Groupe de doublons #{groupIndex + 1}</CardTitle>
                  <CardDescription>
                    {group.length} modèles similaires dans le domaine {getDomainLabel(group[0].domain)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {group.map((assistant, i) => (
                      <div key={assistant.id} className={`p-4 rounded-md ${
                        i === 0 ? (isFuturistic ? 'bg-violet-900/20' : 'bg-violet-50') : (isFuturistic ? 'bg-gray-700/30' : 'bg-gray-50')
                      }`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            {i === 0 && (
                              <Badge variant="secondary" className={isFuturistic ? 'bg-violet-800' : 'bg-violet-100 text-violet-800'}>
                                Référence
                              </Badge>
                            )}
                            <div>
                              <h3 className="font-medium">{assistant.name}</h3>
                              <p className="text-sm text-gray-500 mt-1">{assistant.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline">ID: {assistant.id}</Badge>
                                <Badge className={isFuturistic ? 'bg-blue-700' : 'bg-blue-100 text-blue-800'}>
                                  {getDomainLabel(assistant.domain)}
                                </Badge>
                                <Badge className={isFuturistic ? 'bg-gray-700' : getSimilarityBadgeColor(assistant.similarity)}>
                                  Similarité: {Math.round(assistant.similarity * 100)}%
                                </Badge>
                              </div>
                              
                              <p className="text-xs text-gray-500 mt-2">
                                Créé le {formatDate(assistant.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          {i > 0 && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => mergeTemplates(group[0].id, assistant.id, groupIndex)}
                                disabled={processing[`merge-${group[0].id}-${assistant.id}`]}
                              >
                                {processing[`merge-${group[0].id}-${assistant.id}`] ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <GitMergeIcon className="h-3 w-3" />
                                )}
                                Fusionner
                              </Button>
                              
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => deleteTemplate(assistant.id)}
                                disabled={processing[`delete-${assistant.id}`]}
                              >
                                {processing[`delete-${assistant.id}`] ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2Icon className="h-3 w-3" />
                                )}
                                Supprimer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="border-t bg-card/50 flex justify-between">
                  <p className="text-sm text-gray-500">
                    Action recommandée: Fusionner tous les modèles avec le modèle de référence
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}