import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </Route>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Vérifier les rôles autorisés si nécessaire
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes('admin') ? isAdmin : true;
    
    if (!hasRequiredRole) {
      return (
        <Route path={path}>
          <div className="flex flex-col items-center justify-center min-h-screen p-6">
            <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
            </p>
            <a href="/" className="text-blue-500 hover:underline">
              Retour à l'accueil
            </a>
          </div>
        </Route>
      );
    }
  }

  // Rendu du composant protégé si l'utilisateur est authentifié et a les rôles requis
  return <Route path={path} component={Component} />;
}