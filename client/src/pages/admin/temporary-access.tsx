import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Pencil, Plus, Send, ShieldOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

interface Module {
  id: number;
  name: string;
  displayName: string;
  path: string;
}

interface TemporaryAccess {
  id: number;
  email: string;
  username: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  accessCount: number;
  modules: {
    moduleId: number;
    name: string;
    displayName: string;
    path: string;
  }[];
  notes: string;
  accessToken: string;
}

interface AccessesResponse {
  success: boolean;
  accesses: TemporaryAccess[];
}

interface ModulesResponse {
  success: boolean;
  modules: Module[];
}

const temporaryAccessSchema = z.object({
  id: z.number().optional(),
  email: z.string().email("Email invalide"),
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  notes: z.string().optional(),
  expiresAt: z.date(),
  modules: z.array(z.number()).min(1, "Sélectionnez au moins un module")
});

export default function TemporaryAccessManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState<TemporaryAccess | null>(null);

  // Formulaire d'ajout/modification d'accès temporaire
  const form = useForm<z.infer<typeof temporaryAccessSchema>>({
    resolver: zodResolver(temporaryAccessSchema),
    defaultValues: {
      email: "",
      username: "",
      notes: "",
      expiresAt: addDays(new Date(), 7),
      modules: []
    }
  });

  // Récupérer la liste des accès temporaires
  const { data: accessList, isLoading: isLoadingAccess, isError: isAccessError } = useQuery<AccessesResponse>({
    queryKey: ["/api/admin/temporary-access"],
  });

  // Récupérer la liste des modules disponibles
  const { data: modules, isLoading: isLoadingModules, isError: isModulesError } = useQuery<ModulesResponse>({
    queryKey: ["/api/admin/modules"],
  });
  
  // Gérer les erreurs avec useEffect
  useEffect(() => {
    if (isAccessError) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des accès temporaires.",
        variant: "destructive"
      });
    }
  }, [isAccessError, toast]);
  
  useEffect(() => {
    if (isModulesError) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des modules.",
        variant: "destructive"
      });
    }
  }, [isModulesError, toast]);

  // Mutation pour créer un accès temporaire
  const createAccessMutation = useMutation({
    mutationFn: async (accessData: z.infer<typeof temporaryAccessSchema>) => {
      const res = await apiRequest("POST", "/api/admin/temporary-access", accessData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Accès temporaire créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/temporary-access"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'accès temporaire",
        variant: "destructive"
      });
    }
  });

  // Mutation pour mettre à jour un accès temporaire
  const updateAccessMutation = useMutation({
    mutationFn: async (accessData: z.infer<typeof temporaryAccessSchema>) => {
      const res = await apiRequest("PUT", `/api/admin/temporary-access/${accessData.id}`, {
        body: JSON.stringify(accessData),
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Accès temporaire mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/temporary-access"] });
      setIsEditDialogOpen(false);
      setSelectedAccess(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de l'accès temporaire",
        variant: "destructive"
      });
    }
  });

  // Mutation pour révoquer un accès temporaire
  const revokeAccessMutation = useMutation({
    mutationFn: async (accessId: number) => {
      const res = await apiRequest("POST", `/api/admin/temporary-access/${accessId}/revoke`, {
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Accès temporaire révoqué avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/temporary-access"] });
      setIsDeleteDialogOpen(false);
      setSelectedAccess(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation de l'accès temporaire",
        variant: "destructive"
      });
    }
  });

  // Mutation pour renvoyer l'invitation par email
  const resendInvitationMutation = useMutation({
    mutationFn: async (accessId: number) => {
      const res = await apiRequest("POST", `/api/admin/temporary-access/${accessId}/resend`, {
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Invitation renvoyée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du renvoi de l'invitation",
        variant: "destructive"
      });
    }
  });

  // Initialiser le formulaire d'édition avec les données de l'accès sélectionné
  const handleEditAccess = (access: TemporaryAccess) => {
    setSelectedAccess(access);
    form.reset({
      id: access.id,
      email: access.email,
      username: access.username,
      notes: access.notes,
      expiresAt: new Date(access.expiresAt),
      modules: access.modules.map(m => m.moduleId)
    });
    setIsEditDialogOpen(true);
  };

  // Confirmer la révocation d'un accès
  const handleRevokeAccess = (access: TemporaryAccess) => {
    setSelectedAccess(access);
    setIsDeleteDialogOpen(true);
  };

  // Renvoyer l'invitation
  const handleResendInvitation = (access: TemporaryAccess) => {
    resendInvitationMutation.mutate(access.id);
  };

  // Soumettre le formulaire
  const onSubmit = (data: z.infer<typeof temporaryAccessSchema>) => {
    if (data.id) {
      updateAccessMutation.mutate(data);
    } else {
      createAccessMutation.mutate(data);
    }
  };

  // Fonction pour initialiser un nouvel accès temporaire
  const handleAddAccess = () => {
    form.reset({
      email: "",
      username: "",
      notes: "",
      expiresAt: addDays(new Date(), 7),
      modules: []
    });
    setIsAddDialogOpen(true);
  };

  // Fonction pour confirmer la révocation
  const confirmRevoke = () => {
    if (selectedAccess) {
      revokeAccessMutation.mutate(selectedAccess.id);
    }
  };

  // Obtenir le statut formaté
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Actif
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Expiré
          </Badge>
        );
      case 'revoked':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Révoqué
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des Accès Temporaires</CardTitle>
          <CardDescription>Créer et gérer des accès temporaires aux modules</CardDescription>
        </div>
        <Button onClick={handleAddAccess}>
          <Plus className="mr-2 h-4 w-4" /> Créer un accès
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingAccess ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : accessList && Array.isArray(accessList.accesses) && accessList.accesses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessList.accesses.map((access: TemporaryAccess) => (
                <TableRow key={access.id}>
                  <TableCell className="font-medium">{access.username}</TableCell>
                  <TableCell>{access.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {access.modules && Array.isArray(access.modules) && access.modules.map((module) => (
                        <Badge key={module.moduleId} variant="outline" className="text-xs">
                          {module.displayName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(access.expiresAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(access.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {access.status === 'active' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleEditAccess(access)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleResendInvitation(access)}>
                            <Send className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRevokeAccess(access)}>
                            <ShieldOff className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {access.status !== 'active' && (
                        <Button variant="outline" size="sm" disabled>
                          <Pencil className="h-4 w-4 text-gray-400" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun accès temporaire n'a été trouvé.</p>
            <Button onClick={handleAddAccess} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Créer un accès
            </Button>
          </div>
        )}
      </CardContent>

      {/* Dialogue d'ajout d'accès temporaire */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un accès temporaire</DialogTitle>
            <DialogDescription>
              Créez un accès temporaire pour permettre à un utilisateur d'accéder à des modules spécifiques.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="utilisateur@exemple.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email de l'utilisateur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom de l'utilisateur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'expiration</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Date à laquelle l'accès expirera
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modules"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Modules accessibles</FormLabel>
                      <FormDescription>
                        Sélectionnez les modules auxquels l'utilisateur aura accès
                      </FormDescription>
                    </div>
                    {isLoadingModules ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {modules && Array.isArray(modules.modules) && modules.modules.map((module: Module) => (
                          <FormField
                            key={module.id}
                            control={form.control}
                            name="modules"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={module.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(module.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = [...(field.value || [])];
                                        if (checked) {
                                          if (!currentValues.includes(module.id)) {
                                            field.onChange([...currentValues, module.id]);
                                          }
                                        } else {
                                          field.onChange(
                                            currentValues.filter((value) => value !== module.id)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium">
                                      {module.displayName}
                                    </FormLabel>
                                    <FormDescription>
                                      {module.path}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes concernant cet accès temporaire..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Informations supplémentaires sur cet accès (optionnel)
                    </FormDescription>
                    <FormMessage />
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
                <Button type="submit" disabled={createAccessMutation.isPending}>
                  {createAccessMutation.isPending ? "Traitement..." : "Créer l'accès"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition d'accès temporaire */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier un accès temporaire</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'accès temporaire sélectionné.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="utilisateur@exemple.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email de l'utilisateur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nom de l'utilisateur
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'expiration</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "dd MMMM yyyy", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Date à laquelle l'accès expirera
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modules"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Modules accessibles</FormLabel>
                      <FormDescription>
                        Sélectionnez les modules auxquels l'utilisateur aura accès
                      </FormDescription>
                    </div>
                    {isLoadingModules ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {modules && Array.isArray(modules.modules) && modules.modules.map((module: Module) => (
                          <FormField
                            key={module.id}
                            control={form.control}
                            name="modules"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={module.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(module.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValues = [...(field.value || [])];
                                        if (checked) {
                                          if (!currentValues.includes(module.id)) {
                                            field.onChange([...currentValues, module.id]);
                                          }
                                        } else {
                                          field.onChange(
                                            currentValues.filter((value) => value !== module.id)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="font-medium">
                                      {module.displayName}
                                    </FormLabel>
                                    <FormDescription>
                                      {module.path}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes concernant cet accès temporaire..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Informations supplémentaires sur cet accès (optionnel)
                    </FormDescription>
                    <FormMessage />
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
                <Button type="submit" disabled={updateAccessMutation.isPending}>
                  {updateAccessMutation.isPending ? "Traitement..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de révocation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Révoquer l'accès temporaire</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir révoquer l'accès temporaire pour <strong>{selectedAccess?.username}</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-6">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmRevoke} disabled={revokeAccessMutation.isPending}>
              {revokeAccessMutation.isPending ? "Traitement..." : "Révoquer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}