import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import axios from 'axios';
import { Loader2, Plus, Send, ArrowLeft, Copy, RefreshCw } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ApplicationModule {
  id: number;
  name: string;
  path: string;
  accessLevel: 'all' | 'admin' | 'superadmin';
}

interface TemporaryAccess {
  id: number;
  token: string;
  email: string;
  accessModules: string[];
  expiration: string;
  active: boolean;
  accessCount: number | null;
  maxAccessCount: number | null;
  createdAt: string;
  lastAccessed: string | null;
  notes: string | null;
}

const defaultNewAccess = {
  email: '',
  accessModules: [],
  expiration: '',
  maxAccessCount: 5,
  notes: '',
};

const TemporaryAccessPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [temporaryAccesses, setTemporaryAccesses] = useState<TemporaryAccess[]>([]);
  const [modules, setModules] = useState<ApplicationModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [newAccess, setNewAccess] = useState(defaultNewAccess);
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [selectedAccessId, setSelectedAccessId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [invitationLink, setInvitationLink] = useState<string>('');
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);

  // Charger les données au chargement de la page
  useEffect(() => {
    fetchTemporaryAccesses();
    fetchModules();
  }, []);

  // Formater la date pour l'input date
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Définir une date d'expiration par défaut (7 jours)
  useEffect(() => {
    const defaultExpiration = new Date();
    defaultExpiration.setDate(defaultExpiration.getDate() + 7); // 7 jours par défaut
    setNewAccess(prev => ({
      ...prev,
      expiration: formatDateForInput(defaultExpiration)
    }));
  }, []);

  const fetchTemporaryAccesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/temporary-accesses');
      setTemporaryAccesses(response.data);
      setError(null);
    } catch (err: any) {
      setError(`Erreur lors du chargement des accès temporaires: ${err.response?.data || err.message}`);
      console.error('Erreur lors du chargement des accès temporaires:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/admin/modules');
      // Filtrer pour exclure les modules superadmin
      const filteredModules = response.data.filter(
        (module: ApplicationModule) => module.accessLevel !== 'superadmin'
      );
      setModules(filteredModules);
    } catch (err: any) {
      console.error('Erreur lors du chargement des modules:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des modules",
        variant: "destructive",
      });
    }
  };

  const handleCreateAccess = async () => {
    if (!newAccess.email || newAccess.accessModules.length === 0 || !newAccess.expiration) {
      toast({
        title: "Champs manquants",
        description: "L'email, au moins un module, et la date d'expiration sont requis",
        variant: "destructive",
      });
      return;
    }

    setProcessingAction(true);
    try {
      const response = await axios.post('/api/admin/temporary-access', newAccess);
      await fetchTemporaryAccesses();
      setShowAddDialog(false);
      
      // Afficher le lien d'invitation
      const baseUrl = window.location.origin;
      const inviteLink = `${baseUrl}/verify-access/${response.data.token}`;
      setInvitationLink(inviteLink);
      setShowLinkDialog(true);
      
      setNewAccess(defaultNewAccess);
      toast({
        title: "Accès temporaire créé",
        description: "L'accès temporaire a été créé avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data || "Une erreur est survenue lors de la création de l'accès",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRevokeAccess = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir révoquer cet accès ?")) {
      return;
    }
    
    setProcessingAction(true);
    setSelectedAccessId(id);
    try {
      await axios.post(`/api/admin/temporary-access/${id}/revoke`);
      const updatedAccesses = temporaryAccesses.map(access => 
        access.id === id ? { ...access, active: false } : access
      );
      setTemporaryAccesses(updatedAccesses);
      toast({
        title: "Accès révoqué",
        description: "L'accès temporaire a été révoqué avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data || "Une erreur est survenue lors de la révocation de l'accès",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setSelectedAccessId(null);
    }
  };

  const handleResendInvitation = async (id: number) => {
    setProcessingAction(true);
    setSelectedAccessId(id);
    try {
      await axios.post(`/api/admin/temporary-access/${id}/resend`);
      toast({
        title: "Invitation renvoyée",
        description: "L'invitation a été renvoyée avec succès",
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data || "Une erreur est survenue lors du renvoi de l'invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setSelectedAccessId(null);
    }
  };

  // Helper pour mettre à jour les champs du nouvel accès
  const updateNewAccessField = (field: string, value: any) => {
    setNewAccess(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer la sélection/désélection d'un module
  const toggleModule = (moduleId: number) => {
    setNewAccess(prev => {
      const moduleIdStr = moduleId.toString();
      if (prev.accessModules.includes(moduleIdStr)) {
        return {
          ...prev,
          accessModules: prev.accessModules.filter(id => id !== moduleIdStr)
        };
      } else {
        return {
          ...prev,
          accessModules: [...prev.accessModules, moduleIdStr]
        };
      }
    });
  };

  // Fonction pour copier le lien dans le presse-papier
  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast({
      title: "Lien copié",
      description: "Le lien d'invitation a été copié dans le presse-papier",
    });
  };

  const filteredAccesses = temporaryAccesses.filter(access => 
    activeTab === 'active' ? access.active : !access.active
  );

  if (loading && temporaryAccesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-8 h-8 text-[#006a9e] animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Chargement des accès temporaires...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-[#006a9e] text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Gestion des accès temporaires</h1>
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
          <h2 className="text-2xl font-bold">Accès temporaires</h2>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#006a9e] hover:bg-[#00557e]">
                <Plus className="mr-2 h-4 w-4" /> Créer un nouvel accès
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouvel accès temporaire</DialogTitle>
                <DialogDescription>
                  Créez un accès temporaire pour permettre à un utilisateur externe d'accéder à certains modules.
                  Un email avec un lien unique sera envoyé à l'adresse spécifiée.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email du destinataire *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={newAccess.email}
                      onChange={(e) => updateNewAccessField('email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Date d'expiration *</Label>
                    <Input
                      id="expiration"
                      type="date"
                      value={newAccess.expiration}
                      onChange={(e) => updateNewAccessField('expiration', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAccessCount">Nombre maximum d'utilisations</Label>
                    <Input
                      id="maxAccessCount"
                      type="number"
                      min="1"
                      max="100"
                      value={newAccess.maxAccessCount}
                      onChange={(e) => updateNewAccessField('maxAccessCount', parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notes sur cet accès temporaire..."
                      value={newAccess.notes}
                      onChange={(e) => updateNewAccessField('notes', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="block mb-1">Modules accessibles *</Label>
                    <ScrollArea className="h-[250px] border rounded-md p-4">
                      <div className="space-y-2">
                        {modules.map((module) => (
                          <div key={module.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`module-${module.id}`}
                              checked={newAccess.accessModules.includes(module.id.toString())}
                              onChange={() => toggleModule(module.id)}
                              className="h-4 w-4 text-[#006a9e] focus:ring-[#006a9e]"
                            />
                            <Label htmlFor={`module-${module.id}`} className="font-normal cursor-pointer">
                              {module.name} <span className="text-xs text-muted-foreground">({module.path})</span>
                            </Label>
                          </div>
                        ))}
                        {modules.length === 0 && (
                          <p className="text-sm text-muted-foreground">Aucun module disponible</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleCreateAccess}
                  className="bg-[#006a9e] hover:bg-[#00557e]"
                  disabled={processingAction || !newAccess.email || newAccess.accessModules.length === 0 || !newAccess.expiration}
                >
                  {processingAction ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Créer et envoyer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dialog pour afficher le lien d'invitation */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lien d'invitation créé</DialogTitle>
              <DialogDescription>
                Un email a été envoyé au destinataire, mais vous pouvez également copier ce lien pour le partager manuellement.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Input value={invitationLink} readOnly className="flex-1" />
                <Button size="icon" onClick={copyInvitationLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowLinkDialog(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Liste des accès temporaires</CardTitle>
            <CardDescription>
              Gérez les accès temporaires créés pour les utilisateurs externes.
              Vous pouvez révoquer un accès à tout moment ou renvoyer l'invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="mb-6" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="active">Actifs</TabsTrigger>
                <TabsTrigger value="inactive">Révoqués/Expirés</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {filteredAccesses.length === 0 ? (
              <div className="text-center p-8 border rounded-md bg-gray-50">
                <p className="text-lg text-muted-foreground">
                  {activeTab === 'active' 
                    ? "Aucun accès temporaire actif."
                    : "Aucun accès temporaire révoqué ou expiré."}
                </p>
                {activeTab === 'active' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Cliquez sur "Créer un nouvel accès" pour commencer.
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    {activeTab === 'active' 
                      ? "Liste des accès temporaires actifs"
                      : "Liste des accès temporaires révoqués ou expirés"}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Modules accessibles</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Utilisations</TableHead>
                      <TableHead>Dernière utilisation</TableHead>
                      <TableHead>État</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccesses.map((access) => (
                      <TableRow key={access.id}>
                        <TableCell className="font-medium">{access.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {access.accessModules.map((moduleId) => {
                              const module = modules.find(m => m.id.toString() === moduleId);
                              return module ? (
                                <Badge key={moduleId} variant="outline" className="text-xs">
                                  {module.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(access.expiration).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {access.accessCount !== null && access.maxAccessCount !== null
                            ? `${access.accessCount}/${access.maxAccessCount}`
                            : "Illimité"}
                        </TableCell>
                        <TableCell>
                          {access.lastAccessed 
                            ? new Date(access.lastAccessed).toLocaleString() 
                            : "Jamais utilisé"}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={access.active ? "default" : "destructive"}
                            className={access.active ? "bg-green-500" : ""}
                          >
                            {access.active ? "Actif" : "Révoqué"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {access.active && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleResendInvitation(access.id)}
                                  disabled={selectedAccessId === access.id && processingAction}
                                >
                                  {selectedAccessId === access.id && processingAction ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRevokeAccess(access.id)}
                                  disabled={selectedAccessId === access.id && processingAction}
                                >
                                  {selectedAccessId === access.id && processingAction ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Révoquer"
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TemporaryAccessPage;