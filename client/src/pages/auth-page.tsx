import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import { Lock, Shield } from "lucide-react";

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleLogin = () => {
    // Redirection vers l'API de connexion Replit
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panneau de gauche avec formulaire de connexion */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Connexion à I AM CYBER
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Plateforme d'apprentissage avancée en cybersécurité
            </p>
          </div>

          <div className="mt-10">
            <Button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Lock className="h-4 w-4" />
              Se connecter avec Replit
            </Button>
          </div>

          <div className="mt-10 text-center text-sm text-gray-600">
            <p>
              En vous connectant, vous accédez à l'ensemble des fonctionnalités
              de la plateforme.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau de droite avec description */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-tr from-blue-800 to-blue-600 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <Shield className="h-12 w-12 mr-4" />
            <h2 className="text-3xl font-bold">I AM CYBER</h2>
          </div>
          <h3 className="text-xl font-semibold mb-4">
            Votre parcours d'apprentissage en cybersécurité
          </h3>
          <p className="mb-6">
            I AM CYBER est une plateforme complète qui vous permet d'acquérir
            et de perfectionner vos compétences en cybersécurité à travers
            une variété de modules interactifs et d'outils IA.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="rounded-full bg-blue-500 p-1 mr-3 mt-1">
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p>Modules d'apprentissage interactifs avec gamification</p>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-blue-500 p-1 mr-3 mt-1">
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p>Assistants IA personnalisés pour un accompagnement adapté</p>
            </li>
            <li className="flex items-start">
              <div className="rounded-full bg-blue-500 p-1 mr-3 mt-1">
                <svg
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p>Simulations réalistes de situations de cybersécurité</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}