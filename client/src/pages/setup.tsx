import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export default function SetupPage() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isSettingUpSuperAdmin, setIsSettingUpSuperAdmin] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{ setupComplete: boolean, message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [superUsername, setSuperUsername] = useState("");
  const [superPassword, setSuperPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  
  // Vérifier l'état de la configuration du système
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/system/setup-status");
        const data = await response.json();
        setSetupStatus(data);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'état de configuration:", error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier l'état de configuration du système",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSetupStatus();
  }, [toast]);

  const initializeModules = async () => {
    setIsInitializing(true);
    try {
      const response = await apiRequest("POST", "/api/admin/initialize-modules", {}, {
        headers: {
          'X-User-Role': 'admin'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Initialisation réussie",
          description: "Les modules ont été initialisés avec succès",
        });
        setStatusMessage(`Modules initialisés : ${JSON.stringify(data.modules)}`);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de l'initialisation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des modules:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'initialisation des modules",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!userId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID utilisateur valide",
        variant: "destructive",
      });
      return;
    }

    setIsPromoting(true);
    try {
      const response = await apiRequest("POST", "/api/admin/promote", { userId: parseInt(userId) }, {
        headers: {
          'X-User-Role': 'admin'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Promotion réussie",
          description: "L'utilisateur a été promu administrateur avec succès",
        });
        setStatusMessage(`Utilisateur ${userId} promu administrateur`);
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la promotion",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la promotion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la promotion de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsPromoting(false);
    }
  };
  
  const setupSuperAdmin = async () => {
    // Vérification des champs
    if (!superUsername || superUsername.length < 3) {
      toast({
        title: "Erreur",
        description: "Le nom d'utilisateur doit contenir au moins 3 caractères",
        variant: "destructive",
      });
      return;
    }
    
    if (!superPassword || superPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      });
      return;
    }
    
    if (superPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }
    
    setIsSettingUpSuperAdmin(true);
    try {
      const response = await apiRequest("POST", "/api/system/initialize-super-admin", {
        username: superUsername,
        password: superPassword
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès",
          description: "Super administrateur créé avec succès",
        });
        setStatusMessage(`Super administrateur créé avec succès. ID: ${data.userId}`);
        
        // Mettre à jour le statut
        setSetupStatus({
          setupComplete: true,
          message: "La configuration système est complète"
        });
        
        // Vider les champs
        setSuperUsername("");
        setSuperPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de la création du super administrateur",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du super administrateur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du super administrateur",
        variant: "destructive",
      });
    } finally {
      setIsSettingUpSuperAdmin(false);
    }
  };
  
  const confirmInitialSetup = () => {
    setOpenAlert(false);
    setupSuperAdmin();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-lg">Vérification de l'état de configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Configuration de l'application</h1>
      
      {setupStatus && setupStatus.setupComplete ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">
            La configuration système est déjà complète. Vous pouvez maintenant gérer les modules et les accès.
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">
            La configuration système n'est pas encore complète. Veuillez configurer un super administrateur pour continuer.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!setupStatus?.setupComplete && (
          <Card className="md:col-span-2 border-blue-200 shadow-md">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Configuration du super administrateur</CardTitle>
              <CardDescription>
                Cette configuration initiale est obligatoire pour accéder aux fonctionnalités d'administration
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-6">
                Le super administrateur aura un accès complet à toutes les fonctionnalités de l'application, y compris la gestion des utilisateurs,
                des modules et des accès temporaires. Cette opération ne peut être effectuée qu'une seule fois.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="superUsername" className="text-sm font-medium">
                    Nom d'utilisateur
                  </label>
                  <Input
                    id="superUsername"
                    value={superUsername}
                    onChange={(e) => setSuperUsername(e.target.value)}
                    placeholder="Minimum 3 caractères"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="superPassword" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Input
                    id="superPassword"
                    type="password"
                    value={superPassword}
                    onChange={(e) => setSuperPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-blue-50 border-t border-blue-100">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => setOpenAlert(true)} 
                disabled={isSettingUpSuperAdmin}
              >
                {isSettingUpSuperAdmin ? 
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Configuration en cours...</> : 
                  "Configurer le super administrateur"
                }
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Initialisation des modules</CardTitle>
            <CardDescription>
              Cette opération va créer les modules de base dans la base de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              L'initialisation des modules est nécessaire pour que le portail d'administration
              fonctionne correctement. Cette opération peut être effectuée plusieurs fois sans danger.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={initializeModules} disabled={isInitializing || !setupStatus?.setupComplete}>
              {isInitializing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Initialisation...</> : "Initialiser les modules"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promotion administrateur</CardTitle>
            <CardDescription>
              Promouvoir un utilisateur au rôle d'administrateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Cette opération permet de donner les droits d'administrateur à un utilisateur existant.
              L'ID utilisateur est généralement 1 pour le premier utilisateur créé.
            </p>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="ID utilisateur"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={promoteToAdmin} disabled={isPromoting || !setupStatus?.setupComplete}>
              {isPromoting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Promotion...</> : "Promouvoir en administrateur"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {statusMessage && (
        <div className="mt-6 p-4 bg-muted rounded-md">
          <h2 className="text-xl font-semibold mb-2">Statut</h2>
          <pre className="whitespace-pre-wrap overflow-auto text-sm">{statusMessage}</pre>
        </div>
      )}
      
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de configurer un super administrateur avec le nom d'utilisateur <strong>{superUsername}</strong>.
              <br /><br />
              Cette opération ne peut être effectuée qu'une seule fois. Êtes-vous sûr de vouloir continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmInitialSetup}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}