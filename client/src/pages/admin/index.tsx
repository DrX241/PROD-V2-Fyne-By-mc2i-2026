import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense } from 'react';
import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Importation dynamique des composants pour résoudre les problèmes de dépendances circulaires
const ModulesManagement = lazy(() => import("./modules-management"));
const TemporaryAccessManagement = lazy(() => import("./temporary-access"));

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Lock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Mode Administrateur</h1>
          <p className="text-muted-foreground">Gérez les accès et les modules</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Vérifier si l'utilisateur est administrateur
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    refetchOnWindowFocus: false,
  });

  // Vérifier les statistiques d'administration
  const { data: adminStats, isLoading: statsLoading, isError } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchOnWindowFocus: false,
    retry: false,
  });
  
  // Gérer l'erreur avec useEffect
  useEffect(() => {
    if (isError) {
      setIsAdmin(false);
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur nécessaires.",
        variant: "destructive",
      });
    } else if (adminStats) {
      setIsAdmin(true);
    }
  }, [isError, adminStats, toast]);

  // Redirection si l'utilisateur n'a pas les droits d'administrateur
  useEffect(() => {
    if (isAdmin === false) {
      window.location.href = '/';
    }
  }, [isAdmin]);
  
  if (isAdmin === false) {
    return null;
  }

  return (
    <AdminLayout>
      {isAdmin === null ? (
        <Card>
          <CardHeader>
            <CardTitle>Vérification des droits d'accès...</CardTitle>
            <CardDescription>Veuillez patienter pendant la vérification de vos droits d'administrateur.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert className="mb-6">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Mode Administrateur activé</AlertTitle>
            <AlertDescription>
              Vous avez accès aux fonctionnalités d'administration. Soyez prudent avec les modifications que vous apportez.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="modules">
            <TabsList className="mb-4">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="access">Accès Temporaires</TabsTrigger>
              <TabsTrigger value="system">Système</TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
              <ModulesManagement />
            </TabsContent>

            <TabsContent value="access">
              <TemporaryAccessManagement />
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Administration système</CardTitle>
                  <CardDescription>Fonctionnalités avancées de gestion du système</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Gestion du cache</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => alert("Fonction à implémenter")}>
                          Vider le cache
                        </Button>
                        <Button variant="outline" onClick={() => alert("Fonction à implémenter")}>
                          Invalider le domaine Cyber
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Gestion des utilisateurs</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => alert("Fonction à implémenter")}>
                          Promouvoir un utilisateur
                        </Button>
                        <Button variant="outline" onClick={() => alert("Fonction à implémenter")}>
                          Réinitialiser les limites
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </AdminLayout>
  );
}