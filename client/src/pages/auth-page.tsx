import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Fonction pour vérifier l'authentification directement avec le serveur
async function login(username: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

// Page d'authentification simple
export default function AuthPageSimple() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Si l'utilisateur est authentifié, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Champs incomplets",
        description: "Veuillez entrer un nom d'utilisateur et un mot de passe",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Tentative de connexion
      const user = await login(username, password);
      
      // Succès
      setIsAuthenticated(true);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.username}`,
      });
      
      // Redirection vers la page d'accueil
      setLocation("/");
    } catch (error) {
      // Échec
      console.error("Erreur d'authentification:", error);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: (error as Error).message || "Nom d'utilisateur ou mot de passe incorrect",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex min-h-screen">
      {/* Section de connexion */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 text-center">
            <img src="/assets/logo-mc2i.png" alt="Logo mc2i" className="h-24 w-auto mx-auto mb-4" />
            <h2 className="mt-4 text-3xl font-bold leading-9 tracking-tight text-gray-900">
              Plateforme FYNE
            </h2>
            <p className="mt-2 text-base leading-6 text-gray-600">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour accéder à la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-xs text-center text-gray-600 mt-8">
            L'accès à cette plateforme est réservé aux collaborateurs mc2i et ses partenaires.
            <br />Pour tout problème de connexion, veuillez contacter votre administrateur.
          </p>
        </div>
      </div>

      {/* Section Hero */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 flex flex-col justify-center items-center p-12 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-10 w-40 h-40 rounded-full bg-blue-400 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-indigo-400 blur-xl"></div>
            <div className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-purple-400 blur-lg"></div>
            <div className="absolute top-3/4 left-1/4 w-32 h-32 rounded-full bg-blue-300 blur-xl"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6 leading-tight">
              Bienvenue sur la plateforme
              <span className="block text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-100 mt-2">FYNE</span>
            </h1>
            <p className="text-xl mb-10 text-blue-100 leading-relaxed">
              Une solution innovante de formation et d'accompagnement conçue pour transformer l'expérience des consultants mc2i.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-blue-100">Modules interactifs</h3>
                <p className="text-white/80">Développez vos compétences avec des outils de formation adaptés à votre profil.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all">
                <h3 className="font-semibold text-lg mb-3 text-blue-100">Assistants IA personnalisés</h3>
                <p className="text-white/80">Bénéficiez d'une aide personnalisée propulsée par l'intelligence artificielle.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}