import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Redirect, Route } from 'wouter';
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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#006a9e]" />
          <p className="ml-2 text-lg">Vérification des droits d'accès...</p>
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Accès restreint</h1>
          <p className="text-lg text-center max-w-md">
            Cette section est réservée aux super administrateurs. 
            Vous n'avez pas les droits nécessaires pour y accéder.
          </p>
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