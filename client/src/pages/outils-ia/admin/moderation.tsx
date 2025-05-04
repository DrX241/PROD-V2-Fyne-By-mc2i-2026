import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Filter,
  FileText,
  MessageSquare,
  UserIcon,
  Calendar,
  Flag,
  ThumbsDown,
  ThumbsUp,
  Sparkles,
  AlertTriangle
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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CheckCircle2 } from 'lucide-react';

interface FlaggedContent {
  id: number;
  type: 'prompt' | 'response';
  content: string;
  reason: 'toxicity' | 'hate' | 'violence' | 'sexual' | 'other';
  score: number;
  userId: number;
  userName: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
  domain?: string;
  assistant?: {
    id: number;
    name: string;
  };
}

interface FlaggedContentFilter {
  search: string;
  type: string;
  reason: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  dateRange: {
    start: string;
    end: string;
  };
}

interface ModerationSettings {
  enabled: boolean;
  autoRejectThreshold: number;
  notifyAdmins: boolean;
  blockUser: boolean;
  moderationCategories: {
    toxicity: boolean;
    hate: boolean;
    violence: boolean;
    sexual: boolean;
  };
}

export default function ModerationPage() {
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('content');
  const [filter, setFilter] = useState<FlaggedContentFilter>({
    search: '',
    type: 'all',
    reason: 'all',
    status: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [settings, setSettings] = useState<ModerationSettings>({
    enabled: true,
    autoRejectThreshold: 0.8,
    notifyAdmins: true,
    blockUser: false,
    moderationCategories: {
      toxicity: true,
      hate: true,
      violence: true,
      sexual: true
    }
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const pageSize = 10;

  // Formatage de la date
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

  // Récupère les contenus signalés
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['flaggedContent', currentPage, filter],
    queryFn: async () => {
      try {
        // Simulation pour développement
        // Dans un environnement réel, ce serait un appel à l'API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Génération de données fictives pour le développement
        const flaggedContent: FlaggedContent[] = Array.from({ length: 30 }).map((_, i) => ({
          id: i + 1,
          type: i % 3 === 0 ? 'prompt' : 'response',
          content: i % 3 === 0 
            ? `Comment puis-je pirater le compte email d'une personne?` 
            : `Je ne peux pas vous aider à réaliser des activités illégales comme le piratage de comptes email. C'est une violation de la vie privée et potentiellement illégal.`,
          reason: ['toxicity', 'hate', 'violence', 'sexual', 'other'][i % 5] as any,
          score: Math.random(),
          userId: (i % 10) + 1,
          userName: `user${(i % 10) + 1}`,
          timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
          status: ['pending', 'approved', 'rejected'][i % 3] as any,
          domain: ['cybersecurite', 'amoa', 'data_ia', 'general'][i % 4],
          assistant: i % 3 !== 0 ? {
            id: (i % 5) + 1,
            name: `Assistant ${(i % 5) + 1}`
          } : undefined
        }));
        
        // Filtrage
        let filteredContent = [...flaggedContent];
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredContent = filteredContent.filter(content => 
            content.content.toLowerCase().includes(searchLower) || 
            content.userName.toLowerCase().includes(searchLower)
          );
        }
        
        if (filter.type !== 'all') {
          filteredContent = filteredContent.filter(content => content.type === filter.type);
        }
        
        if (filter.reason !== 'all') {
          filteredContent = filteredContent.filter(content => content.reason === filter.reason);
        }
        
        if (filter.status !== 'all') {
          filteredContent = filteredContent.filter(content => content.status === filter.status);
        }
        
        if (filter.dateRange.start) {
          const startDate = new Date(filter.dateRange.start).getTime();
          filteredContent = filteredContent.filter(content => 
            new Date(content.timestamp).getTime() >= startDate
          );
        }
        
        if (filter.dateRange.end) {
          const endDate = new Date(filter.dateRange.end).getTime() + 86400000; // Add one day to include the end date
          filteredContent = filteredContent.filter(content => 
            new Date(content.timestamp).getTime() <= endDate
          );
        }
        
        // Tri
        filteredContent.sort((a, b) => {
          const sortField = filter.sortBy as keyof FlaggedContent;
          
          if (sortField === 'timestamp') {
            return filter.sortOrder === 'asc' 
              ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          
          const aValue = a[sortField];
          const bValue = b[sortField];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return filter.sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            return filter.sortOrder === 'asc' 
              ? aValue - bValue
              : bValue - aValue;
          }
          
          return 0;
        });
        
        // Pagination
        const totalItems = filteredContent.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedContent = filteredContent.slice(startIndex, startIndex + pageSize);
        
        return {
          flaggedContent: paginatedContent,
          totalItems,
          totalPages,
          currentPage,
          stats: {
            pending: flaggedContent.filter(c => c.status === 'pending').length,
            approved: flaggedContent.filter(c => c.status === 'approved').length,
            rejected: flaggedContent.filter(c => c.status === 'rejected').length,
            total: flaggedContent.length
          }
        };
      } catch (error) {
        console.error('Error fetching flagged content:', error);
        throw error;
      }
    }
  });

  // Mutation pour changer le statut d'un contenu
  const updateContentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'approved' | 'rejected' }) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Statut mis à jour',
        description: `Le contenu a été ${variables.status === 'approved' ? 'approuvé' : 'rejeté'} avec succès.`,
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['flaggedContent'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour mettre à jour les paramètres de modération
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: ModerationSettings) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Paramètres mis à jour',
        description: 'Les paramètres de modération ont été mis à jour avec succès.',
        variant: 'default',
      });
      
      setIsSettingsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour les paramètres: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Gestionnaire pour le changement de tri
  const handleSortChange = (field: string) => {
    setFilter(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Gestionnaire pour la réinitialisation des filtres
  const handleResetFilters = () => {
    setFilter({
      search: '',
      type: 'all',
      reason: 'all',
      status: 'all',
      sortBy: 'timestamp',
      sortOrder: 'desc',
      dateRange: {
        start: '',
        end: ''
      }
    });
    setCurrentPage(1);
  };

  // Obtient l'icône et la couleur pour une raison de signalement
  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'toxicity':
        return {
          icon: <ThumbsDown className="h-3 w-3 mr-1" />,
          label: 'Toxicité',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'hate':
        return {
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          label: 'Discours haineux',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'violence':
        return {
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          label: 'Violence',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'sexual':
        return {
          icon: <Flag className="h-3 w-3 mr-1" />,
          label: 'Contenu sexuel',
          className: 'bg-pink-100 text-pink-800 border-pink-200'
        };
      default:
        return {
          icon: <Flag className="h-3 w-3 mr-1" />,
          label: 'Autre',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Modération de contenu" 
          description="Gérez et filtrez le contenu des prompts et des réponses"
          icon={<Shield className="h-6 w-6 text-violet-500" />}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement des contenus : {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Contenu signalé</TabsTrigger>
            <TabsTrigger value="settings">Paramètres de modération</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.total || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">En attente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.pending || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.approved || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Rejetés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data?.stats.rejected || 0}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans le contenu..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-8"
                />
              </div>

              <Select 
                value={filter.type} 
                onValueChange={(value) => setFilter({ ...filter, type: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="prompt">Prompts</SelectItem>
                  <SelectItem value="response">Réponses</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filter.reason} 
                onValueChange={(value) => setFilter({ ...filter, reason: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les raisons</SelectItem>
                  <SelectItem value="toxicity">Toxicité</SelectItem>
                  <SelectItem value="hate">Discours haineux</SelectItem>
                  <SelectItem value="violence">Violence</SelectItem>
                  <SelectItem value="sexual">Contenu sexuel</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filter.status} 
                onValueChange={(value) => setFilter({ ...filter, status: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filter.dateRange.start}
                  onChange={(e) => setFilter({ 
                    ...filter, 
                    dateRange: { ...filter.dateRange, start: e.target.value } 
                  })}
                  className="w-40"
                />
                <span>-</span>
                <Input
                  type="date"
                  value={filter.dateRange.end}
                  onChange={(e) => setFilter({ 
                    ...filter, 
                    dateRange: { ...filter.dateRange, end: e.target.value } 
                  })}
                  className="w-40"
                />
              </div>

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
            </div>

            {/* Tableau du contenu signalé */}
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
                        <TableHead className="w-[80px]">
                          <button 
                            className="flex items-center gap-1 w-full text-left"
                            onClick={() => handleSortChange('type')}
                          >
                            Type
                            {filter.sortBy === 'type' && (
                              <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[300px]">Contenu</TableHead>
                        <TableHead className="w-[120px]">
                          <button 
                            className="flex items-center gap-1 w-full text-left"
                            onClick={() => handleSortChange('reason')}
                          >
                            Raison
                            {filter.sortBy === 'reason' && (
                              <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <button 
                            className="flex items-center gap-1 w-full text-left"
                            onClick={() => handleSortChange('score')}
                          >
                            Score
                            {filter.sortBy === 'score' && (
                              <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[120px]">
                          <button 
                            className="flex items-center gap-1 w-full text-left"
                            onClick={() => handleSortChange('userName')}
                          >
                            Utilisateur
                            {filter.sortBy === 'userName' && (
                              <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[150px]">
                          <button 
                            className="flex items-center gap-1 w-full text-left"
                            onClick={() => handleSortChange('timestamp')}
                          >
                            Date
                            {filter.sortBy === 'timestamp' && (
                              <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[100px]">
                          <button 
                            className="flex items-center gap-1 w-full text-left"
                            onClick={() => handleSortChange('status')}
                          >
                            Statut
                            {filter.sortBy === 'status' && (
                              <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </button>
                        </TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.flaggedContent?.length ? (
                        data.flaggedContent.map((content) => (
                          <TableRow key={content.id}>
                            <TableCell>
                              <Badge variant="outline" className={
                                content.type === 'prompt' 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-green-100 text-green-800 border-green-200'
                              }>
                                {content.type === 'prompt' ? (
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                ) : (
                                  <Sparkles className="h-3 w-3 mr-1" />
                                )}
                                {content.type === 'prompt' ? 'Prompt' : 'Réponse'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate">
                                {content.content}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getReasonBadge(content.reason).className}>
                                {getReasonBadge(content.reason).icon}
                                {getReasonBadge(content.reason).label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      content.score > 0.7 ? 'bg-red-600' :
                                      content.score > 0.4 ? 'bg-amber-500' :
                                      'bg-green-600'
                                    }`}
                                    style={{ width: `${Math.min(100, content.score * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs">{Math.round(content.score * 100)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{content.userName}</TableCell>
                            <TableCell>{formatDate(content.timestamp)}</TableCell>
                            <TableCell>
                              <Badge variant={
                                content.status === 'approved' ? 'outline' :
                                content.status === 'rejected' ? 'destructive' :
                                'default'
                              } className={
                                content.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                                content.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-amber-100 text-amber-800'
                              }>
                                {content.status === 'approved' ? (
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                ) : content.status === 'rejected' ? (
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {content.status === 'approved' ? 'Approuvé' :
                                content.status === 'rejected' ? 'Rejeté' :
                                'En attente'}
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
                                      setSelectedContent(content);
                                      setIsViewDialogOpen(true);
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" /> Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {content.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          updateContentStatusMutation.mutate({
                                            id: content.id,
                                            status: 'approved'
                                          });
                                        }}
                                        className="flex items-center gap-2 text-green-600"
                                      >
                                        <CheckCircle className="h-4 w-4" /> Approuver
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => {
                                          updateContentStatusMutation.mutate({
                                            id: content.id,
                                            status: 'rejected'
                                          });
                                        }}
                                        className="flex items-center gap-2 text-destructive"
                                      >
                                        <XCircle className="h-4 w-4" /> Rejeter
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {content.status !== 'pending' && (
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        updateContentStatusMutation.mutate({
                                          id: content.id,
                                          status: 'pending'
                                        });
                                      }}
                                      className="flex items-center gap-2"
                                    >
                                      <RefreshCw className="h-4 w-4" /> Réinitialiser
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            Aucun contenu signalé trouvé.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              
              {/* Pagination */}
              {data?.flaggedContent?.length > 0 && (
                <CardFooter className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, data?.totalItems || 0)} sur {data?.totalItems || 0} contenus
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
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de modération</CardTitle>
                <CardDescription>
                  Configurez les options de modération automatique du contenu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Modération automatique</h3>
                      <p className="text-sm text-muted-foreground">
                        Active la vérification automatique du contenu des prompts et des réponses
                      </p>
                    </div>
                    <Switch 
                      id="moderation-enabled"
                      checked={settings.enabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        enabled: checked
                      })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Options de filtrage</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Toxicité</label>
                          <p className="text-xs text-muted-foreground">
                            Filtrer le contenu grossier ou menaçant
                          </p>
                        </div>
                        <Switch 
                          checked={settings.moderationCategories.toxicity}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            moderationCategories: {
                              ...settings.moderationCategories,
                              toxicity: checked
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Discours haineux</label>
                          <p className="text-xs text-muted-foreground">
                            Filtrer le contenu discriminatoire
                          </p>
                        </div>
                        <Switch 
                          checked={settings.moderationCategories.hate}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            moderationCategories: {
                              ...settings.moderationCategories,
                              hate: checked
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Violence</label>
                          <p className="text-xs text-muted-foreground">
                            Filtrer le contenu violent ou incitant à la violence
                          </p>
                        </div>
                        <Switch 
                          checked={settings.moderationCategories.violence}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            moderationCategories: {
                              ...settings.moderationCategories,
                              violence: checked
                            }
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Contenu sexuel</label>
                          <p className="text-xs text-muted-foreground">
                            Filtrer le contenu sexuel explicite
                          </p>
                        </div>
                        <Switch 
                          checked={settings.moderationCategories.sexual}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            moderationCategories: {
                              ...settings.moderationCategories,
                              sexual: checked
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Actions automatiques</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Seuil de rejet automatique
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.05"
                            value={settings.autoRejectThreshold}
                            onChange={(e) => setSettings({
                              ...settings,
                              autoRejectThreshold: parseFloat(e.target.value)
                            })}
                            className="w-full"
                          />
                          <span className="min-w-[45px] text-center">
                            {Math.round(settings.autoRejectThreshold * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Score de modération à partir duquel le contenu est automatiquement rejeté
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Notification administrateurs</label>
                          <p className="text-xs text-muted-foreground">
                            Envoyer une notification aux administrateurs pour les contenus signalés
                          </p>
                        </div>
                        <Switch 
                          checked={settings.notifyAdmins}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            notifyAdmins: checked
                          })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">Blocage utilisateur</label>
                          <p className="text-xs text-muted-foreground">
                            Bloquer temporairement l'utilisateur après des violations répétées
                          </p>
                        </div>
                        <Switch 
                          checked={settings.blockUser}
                          onCheckedChange={(checked) => setSettings({
                            ...settings,
                            blockUser: checked
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSettings({
                    enabled: true,
                    autoRejectThreshold: 0.8,
                    notifyAdmins: true,
                    blockUser: false,
                    moderationCategories: {
                      toxicity: true,
                      hate: true,
                      violence: true,
                      sexual: true
                    }
                  })}
                >
                  Réinitialiser
                </Button>
                <Button 
                  onClick={() => updateSettingsMutation.mutate(settings)}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de détails de contenu */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Détails du contenu signalé
                <Badge variant={
                  selectedContent?.type === 'prompt' 
                    ? 'outline'
                    : 'default'
                } className={
                  selectedContent?.type === 'prompt' 
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-green-100 text-green-800 border-green-200'
                }>
                  {selectedContent?.type === 'prompt' ? (
                    <MessageSquare className="h-3 w-3 mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  {selectedContent?.type === 'prompt' ? 'Prompt' : 'Réponse'}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Examiné le {selectedContent && formatDate(selectedContent.timestamp)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedContent && (
              <div className="space-y-6 my-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Contenu</label>
                  <div className="border p-4 rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                    {selectedContent.content}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Score de modération</label>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedContent.score > 0.7 ? 'bg-red-600' :
                            selectedContent.score > 0.4 ? 'bg-amber-500' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${Math.min(100, selectedContent.score * 100)}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(selectedContent.score * 100)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Raison du signalement</label>
                    <Badge variant="outline" className={getReasonBadge(selectedContent.reason).className}>
                      {getReasonBadge(selectedContent.reason).icon}
                      {getReasonBadge(selectedContent.reason).label}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Utilisateur</label>
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedContent.userName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Domaine</label>
                    <span>{selectedContent.domain || 'Non spécifié'}</span>
                  </div>
                </div>
                
                {selectedContent.assistant && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assistant</label>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedContent.assistant.name} (ID: {selectedContent.assistant.id})</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Statut actuel</label>
                  <Badge variant={
                    selectedContent.status === 'approved' ? 'outline' :
                    selectedContent.status === 'rejected' ? 'destructive' :
                    'default'
                  } className={
                    selectedContent.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                    selectedContent.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-amber-100 text-amber-800'
                  }>
                    {selectedContent.status === 'approved' ? (
                      <ThumbsUp className="h-3 w-3 mr-1" />
                    ) : selectedContent.status === 'rejected' ? (
                      <ThumbsDown className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {selectedContent.status === 'approved' ? 'Approuvé' :
                    selectedContent.status === 'rejected' ? 'Rejeté' :
                    'En attente'}
                  </Badge>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Fermer</Button>
              </DialogClose>
              
              {selectedContent && selectedContent.status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      updateContentStatusMutation.mutate({
                        id: selectedContent.id,
                        status: 'rejected'
                      });
                      setIsViewDialogOpen(false);
                    }}
                    disabled={updateContentStatusMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  
                  <Button 
                    variant="default" 
                    onClick={() => {
                      updateContentStatusMutation.mutate({
                        id: selectedContent.id,
                        status: 'approved'
                      });
                      setIsViewDialogOpen(false);
                    }}
                    disabled={updateContentStatusMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approuver
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}