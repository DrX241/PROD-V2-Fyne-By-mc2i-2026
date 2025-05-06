import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import axios from 'axios';
import { Loader2, Plus, Save, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface ApplicationModule {
  id: number;
  name: string;
  path: string;
  description: string;
  active: boolean;
  accessLevel: 'all' | 'admin' | 'superadmin';
  createdAt?: string;
  updatedAt?: string;
}

const defaultNewModule: Omit<ApplicationModule, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  path: '',
  description: '',
  active: true,
  accessLevel: 'all',
};

const ModulesManagement: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isSuperAdmin } = useAdminAuth();
  
  const [modules, setModules] = useState<ApplicationModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [newModule, setNewModule] = useState<Omit<ApplicationModule, 'id' | 'createdAt' | 'updatedAt'>>(defaultNewModule);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  // Charger les modules au chargement de la page
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/modules');
      setModules(response.data);
      setError(null);
    } catch (err: any) {
      setError(`Erreur lors du chargement des modules: ${err.response?.data || err.message}`);
      console.error('Erreur lors du chargement des modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModule.name || !newModule.path) {
      toast({
        title: "Champs manquants",
        description: "Le nom et le chemin sont requis",
        variant: "destructive",
      });
      return;
    }

    setProcessingAction(true);
    try {
      await axios.post('/api/admin/modules', newModule);
      await fetchModules();
      setShowAddDialog(false);
      setNewModule(defaultNewModule);
      toast({
        title: "Module ajouté",
        description: "Le module a été ajouté avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data || "Une erreur est survenue lors de l'ajout du module",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUpdateModule = async (module: ApplicationModule) => {
    setProcessingAction(true);
    setSelectedModuleId(module.id);
    try {
      await axios.put(`/api/admin/modules/${module.id}`, module);
      const updatedModules = modules.map(m => m.id === module.id ? module : m);
      setModules(updatedModules);
      toast({
        title: "Module mis à jour",
        description: "Le module a été mis à jour avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data || "Une erreur est survenue lors de la mise à jour du module",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setSelectedModuleId(null);
    }
  };

  const handleDeleteModule = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      return;
    }
    
    setProcessingAction(true);
    setSelectedModuleId(id);
    try {
      await axios.delete(`/api/admin/modules/${id}`);
      setModules(modules.filter(m => m.id !== id));
      toast({
        title: "Module supprimé",
        description: "Le module a été supprimé avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data || "Une erreur est survenue lors de la suppression du module",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setSelectedModuleId(null);
    }
  };

  // Helper pour mettre à jour les champs du nouveau module
  const updateNewModuleField = (field: string, value: any) => {
    setNewModule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper pour mettre à jour les champs d'un module existant
  const updateExistingModuleField = (module: ApplicationModule, field: string, value: any) => {
    const updatedModule = { ...module, [field]: value };
    handleUpdateModule(updatedModule);
  };

  if (loading && modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 text-[#006a9e] animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Chargement des modules...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-[#006a9e] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Gestion des modules</h1>
          </div>
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:text-[#006a9e]"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au tableau de bord
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Modules de l'application</h2>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#006a9e] hover:bg-[#00557e]">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau module</DialogTitle>
                <DialogDescription>
                  Remplissez ce formulaire pour ajouter un nouveau module à l'application.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du module *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Cyber Defense"
                    value={newModule.name}
                    onChange={(e) => updateNewModuleField('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="path">Chemin d'accès *</Label>
                  <Input
                    id="path"
                    placeholder="Ex: /cyber-defense"
                    value={newModule.path}
                    onChange={(e) => updateNewModuleField('path', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description du module..."
                    value={newModule.description}
                    onChange={(e) => updateNewModuleField('description', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accessLevel">Niveau d'accès</Label>
                  <Select
                    value={newModule.accessLevel}
                    onValueChange={(value) => updateNewModuleField('accessLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau d'accès" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      <SelectItem value="admin">Administrateurs uniquement</SelectItem>
                      <SelectItem value="superadmin">Super administrateurs uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newModule.active}
                    onCheckedChange={(checked) => updateNewModuleField('active', checked)}
                  />
                  <Label htmlFor="active">Module actif</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddModule}
                  className="bg-[#006a9e] hover:bg-[#00557e]"
                  disabled={processingAction || !newModule.name || !newModule.path}
                >
                  {processingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Ajouter
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des modules</CardTitle>
            <CardDescription>
              Gérez les modules disponibles dans l'application. Vous pouvez activer ou désactiver des modules,
              modifier leurs paramètres d'accès ou les supprimer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <div className="text-center p-8 border rounded-md bg-gray-50">
                <p className="text-lg text-muted-foreground">Aucun module n'a été trouvé.</p>
                <p className="text-sm text-muted-foreground mt-2">Cliquez sur "Ajouter un module" pour commencer.</p>
              </div>
            ) : (
              <Table>
                <TableCaption>Liste des modules de l'application</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Chemin</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Niveau d'accès</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell>{module.path}</TableCell>
                      <TableCell className="max-w-xs truncate">{module.description}</TableCell>
                      <TableCell>
                        <Select
                          value={module.accessLevel}
                          onValueChange={(value) => updateExistingModuleField(module, 'accessLevel', value)}
                          disabled={selectedModuleId === module.id && processingAction}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les utilisateurs</SelectItem>
                            <SelectItem value="admin">Administrateurs</SelectItem>
                            <SelectItem value="superadmin">Super administrateurs</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={module.active}
                            onCheckedChange={(checked) => updateExistingModuleField(module, 'active', checked)}
                            disabled={selectedModuleId === module.id && processingAction}
                          />
                          <span className="ml-2">{module.active ? 'Actif' : 'Inactif'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                          disabled={selectedModuleId === module.id && processingAction}
                        >
                          {selectedModuleId === module.id && processingAction ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ModulesManagement;