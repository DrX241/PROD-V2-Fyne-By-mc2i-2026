import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, login } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Rediriger vers l'authentification Replit si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    // Déclencher la redirection vers l'authentification Replit
    login();
    // Afficher un composant de chargement en attendant la redirection
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirection vers la page de connexion...</p>
        </div>
      </Route>
    );
  }

  // Si l'utilisateur est authentifié, afficher le composant protégé
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}

// Composant pour les routes accessibles uniquement aux administrateurs
export function AdminRoute({ path, component: Component }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isAdmin, login } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Rediriger vers l'authentification Replit si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    // Déclencher la redirection vers l'authentification Replit
    login();
    // Afficher un composant de chargement en attendant la redirection
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirection vers la page de connexion...</p>
        </div>
      </Route>
    );
  }

  // Rediriger vers la page d'accueil si l'utilisateur n'est pas administrateur
  if (!isAdmin) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Si l'utilisateur est authentifié et administrateur, afficher le composant protégé
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}