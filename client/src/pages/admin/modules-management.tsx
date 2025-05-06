import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2, Lock, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const VALID_USER_ROLES = ['user', 'tester', 'contributor', 'admin'];

interface Module {
  id: number;
  name: string;
  displayName: string;
  description: string;
  category: string;
  path: string;
  icon: string;
  isPublic: boolean;
  requiredRole: string;
  createdAt: string;
  updatedAt: string;
}

const moduleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Le nom est requis"),
  displayName: z.string().min(1, "Le nom d'affichage est requis"),
  description: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise"),
  path: z.string().min(1, "Le chemin est requis"),
  icon: z.string().optional(),
  isPublic: z.boolean().default(false),
  requiredRole: z.string().default("user")
});

export default function ModulesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Formulaire d'ajout/modification de module
  const form = useForm<z.infer<typeof moduleSchema>>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      category: "",
      path: "",
      icon: "",
      isPublic: false,
      requiredRole: "user"
    }
  });

  // Récupérer la liste des modules
  const { data: modules, isLoading, isError } = useQuery({
    queryKey: ["/api/admin/modules"],
  });
  
  // Gérer les erreurs avec useEffect
  useEffect(() => {
    if (isError) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des modules.",
        variant: "destructive"
      });
    }
  }, [isError, toast]);

  // Mutation pour ajouter/modifier un module
  const upsertModuleMutation = useMutation({
    mutationFn: async (moduleData: z.infer<typeof moduleSchema>) => {
      const res = await apiRequest("POST", "/api/admin/modules", moduleData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: selectedModule ? "Module mis à jour avec succès" : "Module créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      form.reset();
      setSelectedModule(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération",
        variant: "destructive"
      });
    }
  });

  // Mutation pour supprimer un module
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/modules/${moduleId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Module supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/modules"] });
      setIsDeleteDialogOpen(false);
      setSelectedModule(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      });
    }
  });

  // Initialiser le formulaire d'édition avec les données du module sélectionné
  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    form.reset({
      id: module.id,
      name: module.name,
      displayName: module.displayName,
      description: module.description,
      category: module.category,
      path: module.path,
      icon: module.icon,
      isPublic: module.isPublic,
      requiredRole: module.requiredRole
    });
    setIsEditDialogOpen(true);
  };

  // Confirmer la suppression d'un module
  const handleDeleteModule = (module: Module) => {
    setSelectedModule(module);
    setIsDeleteDialogOpen(true);
  };

  // Soumettre le formulaire
  const onSubmit = (data: z.infer<typeof moduleSchema>) => {
    upsertModuleMutation.mutate(data);
  };

  // Fonction pour initialiser un nouveau module
  const handleAddModule = () => {
    form.reset({
      name: "",
      displayName: "",
      description: "",
      category: "",
      path: "",
      icon: "",
      isPublic: false,
      requiredRole: "user"
    });
    setIsAddDialogOpen(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDelete = () => {
    if (selectedModule) {
      deleteModuleMutation.mutate(selectedModule.id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des Modules</CardTitle>
          <CardDescription>Gérer les modules disponibles dans l'application</CardDescription>
        </div>
        <Button onClick={handleAddModule}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un module
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : modules?.modules?.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Chemin</TableHead>
                <TableHead>Accès</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.modules.map((module: Module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.displayName}</TableCell>
                  <TableCell>{module.category}</TableCell>
                  <TableCell>{module.path}</TableCell>
                  <TableCell>
                    {module.isPublic ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Eye className="mr-1 h-3 w-3" /> Public
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <Lock className="mr-1 h-3 w-3" /> {module.requiredRole}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditModule(module)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteModule(module)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun module n'a été trouvé.</p>
            <Button onClick={handleAddModule} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un module
            </Button>
          </div>
        )}
      </CardContent>

      {/* Dialogue d'ajout de module */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un module</DialogTitle>
            <DialogDescription>
              Créez un nouveau module dans l'application.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant</FormLabel>
                      <FormControl>
                        <Input placeholder="cyber-escape" {...field} />
                      </FormControl>
                      <FormDescription>
                        Identifiant unique du module (sans espaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input placeholder="CyberEscape" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom affiché dans l'interface
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description du module..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <FormControl>
                        <Input placeholder="Cyber Arcade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chemin d'accès</FormLabel>
                      <FormControl>
                        <Input placeholder="/cyber/arcade/cyber-escape" {...field} />
                      </FormControl>
                      <FormDescription>
                        Chemin URL du module
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icône</FormLabel>
                      <FormControl>
                        <Input placeholder="game-controller" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom de l'icône Lucide
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiredRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle requis</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VALID_USER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Rôle minimal requis pour accéder au module
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Module public</FormLabel>
                      <FormDescription>
                        Si activé, le module sera accessible à tous les utilisateurs sans restriction.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={upsertModuleMutation.isPending}>
                  {upsertModuleMutation.isPending ? "Traitement..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition de module */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier un module</DialogTitle>
            <DialogDescription>
              Modifiez les informations du module sélectionné.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant</FormLabel>
                      <FormControl>
                        <Input placeholder="cyber-escape" {...field} />
                      </FormControl>
                      <FormDescription>
                        Identifiant unique du module (sans espaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input placeholder="CyberEscape" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom affiché dans l'interface
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description du module..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie</FormLabel>
                      <FormControl>
                        <Input placeholder="Cyber Arcade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chemin d'accès</FormLabel>
                      <FormControl>
                        <Input placeholder="/cyber/arcade/cyber-escape" {...field} />
                      </FormControl>
                      <FormDescription>
                        Chemin URL du module
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icône</FormLabel>
                      <FormControl>
                        <Input placeholder="game-controller" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom de l'icône Lucide
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requiredRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle requis</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VALID_USER_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Rôle minimal requis pour accéder au module
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Module public</FormLabel>
                      <FormDescription>
                        Si activé, le module sera accessible à tous les utilisateurs sans restriction.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={upsertModuleMutation.isPending}>
                  {upsertModuleMutation.isPending ? "Traitement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le module "{selectedModule?.displayName}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteModuleMutation.isPending}
            >
              {deleteModuleMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}