import React from 'react';
import { Redirect, Route, RouteComponentProps } from 'wouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requireSuperAdmin?: boolean;
}

export const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  path,
  component: Component,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAdminAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Loader2 className="w-12 h-12 text-[#006a9e] animate-spin mb-4" />
          <p className="text-lg text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </Route>
    );
  }

  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/admin/login" />
      </Route>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Cette page nécessite des privilèges de super administrateur.
          </p>
          <Redirect to="/admin" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
};

export default ProtectedAdminRoute;