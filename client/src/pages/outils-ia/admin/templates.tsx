import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Edit,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  ArrowUpDown,
  MoreHorizontal,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AdminPageTitle from '@/components/layout/AdminPageTitle';
import Layout from '@/components/layout/Layout';
import { apiRequest } from '@/lib/queryClient';
import axios from 'axios';

interface AssistantTemplate {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  exampleDialogue?: string;
  domain: string;
  personality?: string;
  expertise: number;
  gameLevel?: number;
  isDefault: boolean;
  isActive: boolean;
  usage?: number;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  domain: string;
  isActive: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function TemplatesAdminPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<AssistantTemplate | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    domain: 'all',
    isActive: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const pageSize = 10;

  // Fonction d'utilitaire pour obtenir le libellé du domaine
  const getDomainLabel = (domain: string): string => {
    const labels: Record<string, string> = {
      'general': 'Général',
      'cybersecurite': 'Cybersécurité',
      'amoa': 'AMOA',
      'data_ia': 'Data & IA',
      'developpement': 'Développement',
      'cloud': 'Cloud',
      'agile': 'Agile & Méthodes'
    };
    
    return labels[domain] || domain;
  };

  // Requête pour obtenir les modèles d'assistants
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assistantTemplates', currentPage, filters],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/assistants/templates');
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch assistant templates');
        }
        
        let templates = [...response.data.templates];
        
        // Filtrage
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          templates = templates.filter(template => 
            template.name.toLowerCase().includes(searchLower) || 
            template.description.toLowerCase().includes(searchLower) ||
            template.systemPrompt.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.domain !== 'all') {
          templates = templates.filter(template => template.domain === filters.domain);
        }
        
        if (filters.isActive !== 'all') {
          const isActive = filters.isActive === 'active';
          templates = templates.filter(template => template.isActive === isActive);
        }
        
        // Tri
        templates.sort((a, b) => {
          const sortField = filters.sortBy as keyof AssistantTemplate;
          const aValue = a[sortField];
          const bValue = b[sortField];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return filters.sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            return filters.sortOrder === 'asc' 
              ? aValue - bValue
              : bValue - aValue;
          } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
            return filters.sortOrder === 'asc' 
              ? (aValue === bValue ? 0 : aValue ? 1 : -1)
              : (aValue === bValue ? 0 : aValue ? -1 : 1);
          }
          
          return 0;
        });
        
        // Pagination
        const totalItems = templates.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedTemplates = templates.slice(startIndex, startIndex + pageSize);
        
        return {
          templates: paginatedTemplates,
          totalItems,
          totalPages,
          currentPage
        };
      } catch (error) {
        console.error('Error fetching assistant templates:', error);
        throw error;
      }
    }
  });

  // Mutation pour supprimer un modèle
  const deleteMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest(`/api/assistants/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin', // Pour le développement
        }
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Modèle supprimé',
        description: `Le modèle "${selectedTemplate?.name}" a été supprimé avec succès.`,
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['assistantTemplates'] });
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le modèle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour modifier le statut actif/inactif
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      const response = await apiRequest(`/api/assistants/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'x-user-role': 'admin', // Pour le développement
        },
        body: JSON.stringify({ isActive })
      });
      
      return response;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Statut mis à jour',
        description: `Le modèle a été ${variables.isActive ? 'activé' : 'désactivé'}.`,
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['assistantTemplates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de modifier le statut: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour dupliquer un modèle
  const duplicateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      const response = await apiRequest(`/api/assistants/templates/${templateId}/duplicate`, {
        method: 'POST',
        headers: {
          'x-user-role': 'admin', // Pour le développement
        }
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Modèle dupliqué',
        description: `Une copie du modèle "${selectedTemplate?.name}" a été créée.`,
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['assistantTemplates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de dupliquer le modèle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour mettre à jour un modèle
  const updateMutation = useMutation({
    mutationFn: async (updatedTemplate: Partial<AssistantTemplate>) => {
      const { id, ...templateData } = updatedTemplate;
      
      const response = await apiRequest(`/api/assistants/templates/${id}`, {
        method: 'PATCH',
        headers: {
          'x-user-role': 'admin', // Pour le développement
        },
        body: JSON.stringify(templateData)
      });
      
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Modèle mis à jour',
        description: `Le modèle "${selectedTemplate?.name}" a été mis à jour avec succès.`,
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['assistantTemplates'] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le modèle: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Gestionnaire pour le changement de tri
  const handleSortChange = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Gestionnaire pour la réinitialisation des filtres
  const handleResetFilters = () => {
    setFilters({
      search: '',
      domain: 'all',
      isActive: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setCurrentPage(1);
  };

  // Gestionnaire pour la suppression d'un modèle
  const handleDelete = () => {
    if (selectedTemplate) {
      deleteMutation.mutate(selectedTemplate.id);
    }
  };

  // Formater une date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Gestion des modèles d'assistants" 
          description="Gérez les modèles prédéfinis qui servent de base à la création d'assistants personnalisés"
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement des modèles : {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un modèle..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-8"
            />
          </div>

          <Select 
            value={filters.domain} 
            onValueChange={(value) => setFilters({ ...filters, domain: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Domaine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les domaines</SelectItem>
              <SelectItem value="general">Général</SelectItem>
              <SelectItem value="cybersecurite">Cybersécurité</SelectItem>
              <SelectItem value="amoa">AMOA</SelectItem>
              <SelectItem value="data_ia">Data & IA</SelectItem>
              <SelectItem value="developpement">Développement</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
              <SelectItem value="agile">Agile & Méthodes</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.isActive} 
            onValueChange={(value) => setFilters({ ...filters, isActive: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleResetFilters} className="gap-1">
            <Filter className="h-4 w-4" />
            Réinitialiser
          </Button>

          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="gap-1 ml-auto"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            Ajouter un modèle
          </Button>
        </div>

        {/* Tableau des modèles */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead className="w-[200px]">
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('name')}
                      >
                        Nom
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[150px]">
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('domain')}
                      >
                        Domaine
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="w-[100px]">
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('expertise')}
                      >
                        Expertise
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('isActive')}
                      >
                        Statut
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.templates?.length ? (
                    data.templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{template.name}</div>
                          {template.isDefault && (
                            <Badge variant="outline" className="mt-1">Défaut</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getDomainLabel(template.domain)}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {template.description}
                        </TableCell>
                        <TableCell>{template.expertise}/10</TableCell>
                        <TableCell>
                          <Badge 
                            variant={template.isActive ? "default" : "secondary"}
                            className={`${!template.isActive && 'bg-gray-200 text-gray-700'}`}
                          >
                            {template.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setIsViewDialogOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-4 w-4" /> Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setIsEditDialogOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (template) {
                                    duplicateMutation.mutate(template.id);
                                  }
                                }}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-4 w-4" /> Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  toggleActiveMutation.mutate({
                                    id: template.id,
                                    isActive: !template.isActive
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                {template.isActive 
                                  ? <><XCircle className="h-4 w-4" /> Désactiver</> 
                                  : <><CheckCircle className="h-4 w-4" /> Activer</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucun modèle trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          
          {/* Pagination */}
          {data?.templates?.length > 0 && (
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, data?.totalItems || 0)} sur {data?.totalItems || 0} modèles
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, data?.totalPages || 1) }, (_, i) => {
                    // Calcul pour afficher les pages autour de la page courante
                    const pageNum = currentPage <= 3 
                      ? i + 1
                      : currentPage >= (data?.totalPages || 1) - 2
                        ? (data?.totalPages || 1) - 4 + i
                        : currentPage - 2 + i;
                    
                    // Ne pas afficher si la page est hors limites
                    if (pageNum <= 0 || pageNum > (data?.totalPages || 1)) return null;
                    
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(data?.totalPages || 1, prev + 1))}
                      className={currentPage >= (data?.totalPages || 1) ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          )}
        </Card>

        {/* Dialog de suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer le modèle "{selectedTemplate?.name}" ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Supprimer ce modèle peut affecter les assistants existants qui l'utilisent comme base.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="secondary">Annuler</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer définitivement'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de visualisation */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2">
                  {selectedTemplate?.name}
                  {selectedTemplate?.isDefault && (
                    <Badge variant="outline">Modèle par défaut</Badge>
                  )}
                </div>
              </DialogTitle>
              <DialogDescription>
                Modèle d'assistant {selectedTemplate?.isActive ? 'actif' : 'inactif'} dans le domaine {getDomainLabel(selectedTemplate?.domain || 'general')}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplate && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">ID</Label>
                    <div className="font-medium">{selectedTemplate.id}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Domaine</Label>
                    <div className="font-medium">{getDomainLabel(selectedTemplate.domain)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Niveau d'expertise</Label>
                    <div className="font-medium">{selectedTemplate.expertise}/10</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Niveau de gamification</Label>
                    <div className="font-medium">{selectedTemplate.gameLevel || 'Non défini'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Personnalité</Label>
                    <div className="font-medium">{selectedTemplate.personality || 'Standard'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Date de création</Label>
                    <div className="font-medium">{formatDate(selectedTemplate.createdAt)}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="mt-1">{selectedTemplate.description}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground text-xs">Prompt système</Label>
                  <div className="mt-1 p-4 bg-muted/40 rounded-md text-sm font-mono whitespace-pre-wrap">
                    {selectedTemplate.systemPrompt}
                  </div>
                </div>
                
                {selectedTemplate.exampleDialogue && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Exemple de dialogue</Label>
                    <div className="mt-1 p-4 bg-muted/40 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {selectedTemplate.exampleDialogue}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Fermer</Button>
              </DialogClose>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le modèle</DialogTitle>
              <DialogDescription>
                Modifiez les propriétés du modèle d'assistant
              </DialogDescription>
            </DialogHeader>
            
            {selectedTemplate && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input 
                      id="name"
                      defaultValue={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        name: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="domain">Domaine</Label>
                    <Select 
                      defaultValue={selectedTemplate.domain}
                      onValueChange={(value) => setSelectedTemplate({
                        ...selectedTemplate,
                        domain: value
                      })}
                    >
                      <SelectTrigger id="domain">
                        <SelectValue placeholder="Sélectionnez un domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Général</SelectItem>
                        <SelectItem value="cybersecurite">Cybersécurité</SelectItem>
                        <SelectItem value="amoa">AMOA</SelectItem>
                        <SelectItem value="data_ia">Data & IA</SelectItem>
                        <SelectItem value="developpement">Développement</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                        <SelectItem value="agile">Agile & Méthodes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="expertise">Niveau d'expertise (1-10)</Label>
                    <Input 
                      id="expertise"
                      type="number"
                      min="1"
                      max="10"
                      defaultValue={selectedTemplate.expertise}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        expertise: parseInt(e.target.value, 10)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gameLevel">Niveau de gamification (0-10)</Label>
                    <Input 
                      id="gameLevel"
                      type="number"
                      min="0"
                      max="10"
                      defaultValue={selectedTemplate.gameLevel || 0}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        gameLevel: parseInt(e.target.value, 10)
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="personality">Personnalité</Label>
                    <Select 
                      defaultValue={selectedTemplate.personality || 'standard'}
                      onValueChange={(value) => setSelectedTemplate({
                        ...selectedTemplate,
                        personality: value
                      })}
                    >
                      <SelectTrigger id="personality">
                        <SelectValue placeholder="Sélectionnez une personnalité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="friendly">Amical</SelectItem>
                        <SelectItem value="professional">Professionnel</SelectItem>
                        <SelectItem value="technical">Technique</SelectItem>
                        <SelectItem value="pedagogical">Pédagogique</SelectItem>
                        <SelectItem value="humorous">Humoristique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch 
                      id="isActive"
                      checked={selectedTemplate.isActive}
                      onCheckedChange={(checked) => setSelectedTemplate({
                        ...selectedTemplate,
                        isActive: checked
                      })}
                    />
                    <Label htmlFor="isActive">Actif</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-6">
                    <Switch 
                      id="isDefault"
                      checked={selectedTemplate.isDefault}
                      onCheckedChange={(checked) => setSelectedTemplate({
                        ...selectedTemplate,
                        isDefault: checked
                      })}
                    />
                    <Label htmlFor="isDefault">Modèle par défaut</Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    rows={3}
                    defaultValue={selectedTemplate.description}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      description: e.target.value
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="systemPrompt">Prompt système</Label>
                  <Textarea 
                    id="systemPrompt"
                    rows={6}
                    defaultValue={selectedTemplate.systemPrompt}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      systemPrompt: e.target.value
                    })}
                    className="font-mono text-sm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="exampleDialogue">Exemple de dialogue (facultatif)</Label>
                  <Textarea 
                    id="exampleDialogue"
                    rows={6}
                    defaultValue={selectedTemplate.exampleDialogue || ''}
                    onChange={(e) => setSelectedTemplate({
                      ...selectedTemplate,
                      exampleDialogue: e.target.value
                    })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Annuler</Button>
              </DialogClose>
              <Button 
                variant="default" 
                onClick={() => {
                  if (selectedTemplate) {
                    updateMutation.mutate(selectedTemplate);
                  }
                }}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les modifications'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}