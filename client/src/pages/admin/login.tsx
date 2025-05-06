import { useState } from "react";
import { useLocation } from "wouter";
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
import { Loader2, Shield, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Vérifier l'état d'initialisation du système
  useState(() => {
    const checkSystemSetup = async () => {
      try {
        const response = await apiRequest("GET", "/api/system/setup-status");
        const data = await response.json();
        
        if (!data.setupComplete) {
          setSetupRequired(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'état du système:", error);
      } finally {
        setIsCheckingSetup(false);
      }
    };
    
    checkSystemSetup();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom d'utilisateur et un mot de passe",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/system/authenticate-super-admin", {
        username,
        password
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté en tant que super administrateur",
        });
        
        // Rediriger vers le tableau de bord d'administration
        setLocation("/admin");
      } else {
        // Vérifier si une configuration initiale est requise
        if (data.setupRequired) {
          toast({
            title: "Configuration requise",
            description: "Le système doit être configuré avant la première utilisation",
          });
          setSetupRequired(true);
        } else {
          toast({
            title: "Erreur d'authentification",
            description: data.message || "Nom d'utilisateur ou mot de passe incorrect",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la tentative de connexion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToSetup = () => {
    setLocation("/setup");
  };

  if (isCheckingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto animate-spin text-primary" />
          <p className="mt-4 text-lg">Vérification de l'état du système...</p>
        </div>
      </div>
    );
  }

  if (setupRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md border-yellow-200 shadow-lg">
          <CardHeader className="bg-yellow-50 border-b border-yellow-100">
            <ShieldAlert className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-center text-yellow-800">Configuration initiale requise</CardTitle>
            <CardDescription className="text-center text-yellow-700">
              Le système n'est pas encore configuré
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Avant de pouvoir utiliser l'interface d'administration, vous devez configurer un super administrateur.
              Cette opération ne peut être effectuée qu'une seule fois.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={goToSetup} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Aller à la page de configuration
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-center">Administration</CardTitle>
          <CardDescription className="text-center">
            Authentification Super Administrateur
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Nom d'utilisateur
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authentification...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}