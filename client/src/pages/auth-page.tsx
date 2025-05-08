import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { user, isLoading, login } = useAuth();
  const [location, setLocation] = useLocation();

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Section formulaire à gauche */}
      <div className="flex flex-col items-center justify-center p-6 md:w-1/2 bg-background">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">I AM CYBER</h1>
            <p className="mt-2 text-muted-foreground">
              Plateforme de formation à la cybersécurité par mc2i
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder à la plateforme I AM CYBER
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-center">
                <p>Utilisez votre compte Replit pour vous connecter</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={login}
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Se connecter avec Replit"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Section héros à droite */}
      <div className="hidden md:flex flex-col items-center justify-center p-6 md:w-1/2 bg-primary/5">
        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-bold text-primary">Apprendre la cybersécurité de façon interactive</h2>
          <p className="text-lg">
            I AM CYBER est une plateforme immersive qui rend l'apprentissage
            de la cybersécurité engageant et efficace grâce à des modules
            interactifs, des simulations réalistes et un suivi personnalisé.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Protégez votre Organisation</h3>
                <p className="text-muted-foreground">
                  Apprenez à détecter et prévenir les attaques informatiques
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Formez-vous à votre rythme</h3>
                <p className="text-muted-foreground">
                  Des parcours adaptés à tous les niveaux et toutes les spécialités
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Accès en ligne 24/7</h3>
                <p className="text-muted-foreground">
                  Accessible depuis n'importe quel appareil, partout dans le monde
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}