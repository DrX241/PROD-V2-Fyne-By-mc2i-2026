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

export default function SetupPage() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [userId, setUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Configuration de l'application</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Button onClick={initializeModules} disabled={isInitializing}>
              {isInitializing ? "Initialisation..." : "Initialiser les modules"}
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
            <Button onClick={promoteToAdmin} disabled={isPromoting}>
              {isPromoting ? "Promotion..." : "Promouvoir en administrateur"}
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
    </div>
  );
}