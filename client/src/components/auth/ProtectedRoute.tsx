import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

type ProtectedRouteProps = {
  path: string;
  component: React.FC;
  adminOnly?: boolean;
};

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement...</span>
        </div>
      </Route>
    );
  }

  if (!isAuthenticated) {
    return (
      <Route path={path}>
        {() => {
          window.location.href = "/auth";
          return null;
        }}
      </Route>
    );
  }

  // Vérification supplémentaire pour les routes admin
  if (adminOnly && !isAdmin) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
          <p className="text-center text-muted-foreground mb-6">
            Vous n'avez pas les droits d'accès nécessaires pour cette page.
          </p>
          <a href="/" className="text-primary hover:underline">
            Retour à l'accueil
          </a>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}