import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  UserPlus,
  Shield,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  MoreHorizontal,
  EyeIcon,
  KeyIcon,
  BarChart2Icon,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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

interface UserData {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive' | 'pending';
  department?: string;
  lastActive?: string;
  createdAt: string;
  assistantCount?: number;
  apiUsage?: number;
}

interface UserFilter {
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function UsersAdminPage() {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResetAPIDialogOpen, setIsResetAPIDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<UserFilter>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'username',
    sortOrder: 'asc',
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

  // Requête pour obtenir les utilisateurs
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminUsers', currentPage, filter],
    queryFn: async () => {
      try {
        // Simulation pour développement
        // Dans un environnement réel, ce serait un appel à l'API
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Génération de données fictives pour le développement
        const users: UserData[] = Array.from({ length: 30 }).map((_, i) => ({
          id: i + 1,
          username: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: i === 0 ? 'admin' : (i < 5 ? 'manager' : 'user'),
          status: i % 10 === 0 ? 'pending' : (i % 7 === 0 ? 'inactive' : 'active'),
          department: ['RH', 'IT', 'Marketing', 'Finance'][i % 4],
          lastActive: new Date(Date.now() - (i * 86400000)).toISOString(),
          createdAt: new Date(Date.now() - (i * 2 * 86400000)).toISOString(),
          assistantCount: Math.floor(Math.random() * 5),
          apiUsage: Math.floor(Math.random() * 1000)
        }));
        
        // Filtrage
        let filteredUsers = [...users];
        
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.username.toLowerCase().includes(searchLower) || 
            user.email.toLowerCase().includes(searchLower) ||
            (user.department && user.department.toLowerCase().includes(searchLower))
          );
        }
        
        if (filter.role !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.role === filter.role);
        }
        
        if (filter.status !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.status === filter.status);
        }
        
        // Tri
        filteredUsers.sort((a, b) => {
          const sortField = filter.sortBy as keyof UserData;
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
        const totalItems = filteredUsers.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
        
        return {
          users: paginatedUsers,
          totalItems,
          totalPages,
          currentPage
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    }
  });

  // Mutation pour activer/désactiver un utilisateur
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'active' | 'inactive' | 'pending' }) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Statut mis à jour',
        description: `Le statut de l'utilisateur a été mis à jour avec succès.`,
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de modifier le statut: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Utilisateur supprimé',
        description: `L'utilisateur a été supprimé avec succès.`,
        variant: 'default',
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer l'utilisateur: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour mettre à jour un utilisateur
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<UserData>) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Utilisateur mis à jour',
        description: `Les informations de l'utilisateur ont été mises à jour avec succès.`,
        variant: 'default',
      });
      
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour l'utilisateur: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour réinitialiser les limites API d'un utilisateur
  const resetAPILimitsMutation = useMutation({
    mutationFn: async (userId: number) => {
      try {
        const response = await apiRequest(`/api/admin/ratelimiter/reset/${userId}`, {
          method: 'POST',
          headers: {
            'x-user-role': 'admin' // Pour le développement
          }
        });
        
        return response;
      } catch (error) {
        console.error('Error resetting API limits:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Limites API réinitialisées',
        description: `Les limites d'API de l'utilisateur ont été réinitialisées avec succès.`,
        variant: 'default',
      });
      
      setIsResetAPIDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de réinitialiser les limites d'API: ${error.message}`,
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
      role: 'all',
      status: 'all',
      sortBy: 'username',
      sortOrder: 'asc',
    });
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Gestion des utilisateurs" 
          description="Gérez les utilisateurs, leurs rôles et leurs accès à la plateforme"
          icon={<User className="h-6 w-6 text-violet-500" />}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement des utilisateurs : {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, département..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-8"
            />
          </div>

          <Select 
            value={filter.role} 
            onValueChange={(value) => setFilter({ ...filter, role: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">Utilisateur</SelectItem>
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
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
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
            <UserPlus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {/* Tableau des utilisateurs */}
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
                        onClick={() => handleSortChange('username')}
                      >
                        Utilisateur
                        {filter.sortBy === 'username' && (
                          <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('email')}
                      >
                        Email
                        {filter.sortBy === 'email' && (
                          <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('role')}
                      >
                        Rôle
                        {filter.sortBy === 'role' && (
                          <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
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
                    <TableHead className="w-[120px]">
                      <button 
                        className="flex items-center gap-1 w-full text-left"
                        onClick={() => handleSortChange('apiUsage')}
                      >
                        API Usage
                        {filter.sortBy === 'apiUsage' && (
                          <span className="text-xs">{filter.sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users?.length ? (
                    data.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.department && `${user.department} • `}
                            Inscrit le {formatDate(user.createdAt).split(' ')[0]}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'manager' ? 'default' :
                            'secondary'
                          }>
                            {user.role === 'admin' ? 'Admin' :
                             user.role === 'manager' ? 'Manager' :
                             'Utilisateur'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            user.status === 'active' ? 'outline' :
                            user.status === 'inactive' ? 'secondary' :
                            'default'
                          } className={
                            user.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-amber-100 text-amber-800'
                          }>
                            {user.status === 'active' ? 'Actif' :
                             user.status === 'inactive' ? 'Inactif' :
                             'En attente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, user.apiUsage / 10)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{user.apiUsage}</span>
                          </div>
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
                                  setSelectedUser(user);
                                  setIsViewDialogOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <EyeIcon className="h-4 w-4" /> Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditDialogOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Pencil className="h-4 w-4" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  toggleStatusMutation.mutate({
                                    id: user.id,
                                    status: user.status === 'active' ? 'inactive' : 'active'
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                {user.status === 'active' 
                                  ? <><XCircle className="h-4 w-4" /> Désactiver</> 
                                  : <><CheckCircle className="h-4 w-4" /> Activer</>
                                }
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsResetAPIDialogOpen(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <KeyIcon className="h-4 w-4" /> Réinitialiser API
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
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
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          
          {/* Pagination */}
          {data?.users?.length > 0 && (
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, data?.totalItems || 0)} sur {data?.totalItems || 0} utilisateurs
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

        {/* Modal de confirmation de suppression */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l'utilisateur {selectedUser?.username} ({selectedUser?.email}) ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  La suppression d'un utilisateur entraînera également la suppression de tous ses assistants personnalisés et historiques de conversation.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="secondary">Annuler</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? (
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

        {/* Modal de détails utilisateur */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedUser?.username}
                <Badge variant={
                  selectedUser?.role === 'admin' ? 'destructive' :
                  selectedUser?.role === 'manager' ? 'default' :
                  'secondary'
                }>
                  {selectedUser?.role === 'admin' ? 'Admin' :
                   selectedUser?.role === 'manager' ? 'Manager' :
                   'Utilisateur'}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Détails de l'utilisateur et statistiques d'utilisation
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6 my-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground text-xs">Nom d'utilisateur</Label>
                    <div className="font-medium">{selectedUser.username}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <div className="font-medium">{selectedUser.email}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Date d'inscription</Label>
                    <div className="font-medium">{formatDate(selectedUser.createdAt)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Dernière activité</Label>
                    <div className="font-medium">{selectedUser.lastActive ? formatDate(selectedUser.lastActive) : 'Jamais'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Département</Label>
                    <div className="font-medium">{selectedUser.department || 'Non spécifié'}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Statut</Label>
                    <div>
                      <Badge variant={
                        selectedUser.status === 'active' ? 'outline' :
                        selectedUser.status === 'inactive' ? 'secondary' :
                        'default'
                      } className={
                        selectedUser.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                        selectedUser.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-amber-100 text-amber-800'
                      }>
                        {selectedUser.status === 'active' ? 'Actif' :
                        selectedUser.status === 'inactive' ? 'Inactif' :
                        'En attente'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium text-lg mb-4">Statistiques d'utilisation</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Assistants personnalisés</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{selectedUser.assistantCount || 0}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Utilisation API</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{selectedUser.apiUsage || 0}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (selectedUser.apiUsage || 0) / 10)}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedUser) {
                    resetAPILimitsMutation.mutate(selectedUser.id);
                  }
                }}
                disabled={resetAPILimitsMutation.isPending}
                className="mr-auto"
              >
                {resetAPILimitsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-4 w-4 mr-2" />
                    Réinitialiser API
                  </>
                )}
              </Button>
              
              <DialogClose asChild>
                <Button variant="secondary">Fermer</Button>
              </DialogClose>
              
              <Button 
                variant="default" 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de modification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifier les informations de l'utilisateur {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6 my-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input 
                      id="username"
                      defaultValue={selectedUser.username}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        username: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email"
                      defaultValue={selectedUser.email}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        email: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <Select 
                      defaultValue={selectedUser.role}
                      onValueChange={(value: 'admin' | 'manager' | 'user') => setSelectedUser({
                        ...selectedUser,
                        role: value
                      })}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">Utilisateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Statut</Label>
                    <Select 
                      defaultValue={selectedUser.status}
                      onValueChange={(value: 'active' | 'inactive' | 'pending') => setSelectedUser({
                        ...selectedUser,
                        status: value
                      })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <Label htmlFor="department">Département</Label>
                    <Input 
                      id="department"
                      defaultValue={selectedUser.department}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        department: e.target.value
                      })}
                    />
                  </div>
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
                  if (selectedUser) {
                    updateUserMutation.mutate(selectedUser);
                  }
                }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
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

        {/* Modal de réinitialisation des limites API */}
        <Dialog open={isResetAPIDialogOpen} onOpenChange={setIsResetAPIDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Réinitialiser les limites API</DialogTitle>
              <DialogDescription>
                Voulez-vous réinitialiser les limites d'API pour l'utilisateur {selectedUser?.username} ?
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <Alert>
                <BarChart2Icon className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Cette action réinitialisera les compteurs de requêtes API et supprimera tout blocage de rate limiting pour cet utilisateur.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="secondary">Annuler</Button>
              </DialogClose>
              <Button 
                variant="default" 
                onClick={() => selectedUser && resetAPILimitsMutation.mutate(selectedUser.id)}
                disabled={resetAPILimitsMutation.isPending}
              >
                {resetAPILimitsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser les limites'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}