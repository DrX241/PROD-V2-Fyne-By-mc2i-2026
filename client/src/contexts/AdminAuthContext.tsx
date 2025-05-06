import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types
interface AdminUser {
  id: number;
  username: string;
  role: "admin" | "superadmin";
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  error: string | null;
  checkAuthStatus: () => Promise<void>;
}

// Créer le contexte
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Provider Component
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fonction pour vérifier l'état d'authentification
  const checkAuthStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/system/auth-status');
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(data.isAuthenticated);
        setIsSuperAdmin(data.isSuperAdmin);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'état d\'authentification:', err);
      setError('Erreur de connexion au serveur');
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour connecter l'administrateur
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/system/authenticate-super-admin", { username, password });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
        setIsSuperAdmin(data.user.role === "superadmin");
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans l'administration",
          variant: "default",
        });
        
        return true;
      } else {
        setError(data.message || 'Échec de la connexion');
        
        toast({
          title: "Échec de la connexion",
          description: data.message || 'Identifiants invalides',
          variant: "destructive",
        });
        
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError('Erreur de connexion au serveur');
      
      toast({
        title: "Erreur de connexion",
        description: 'Impossible de contacter le serveur',
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour déconnecter l'administrateur
  const logout = async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest("POST", "/api/system/logout-super-admin");
      const data = await response.json();

      if (data.success) {
        setUser(null);
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
        
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté",
          variant: "default",
        });
        
        return true;
      } else {
        setError(data.message || 'Échec de la déconnexion');
        
        toast({
          title: "Échec de la déconnexion",
          description: data.message || 'Une erreur est survenue',
          variant: "destructive",
        });
        
        return false;
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      setError('Erreur de connexion au serveur');
      
      toast({
        title: "Erreur de déconnexion",
        description: 'Impossible de contacter le serveur',
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Valeur du contexte
  const value: AdminAuthContextType = {
    user,
    isAuthenticated,
    isSuperAdmin,
    isLoading,
    login,
    logout,
    error,
    checkAuthStatus
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook pour utiliser le contexte d'authentification admin
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth doit être utilisé à l\'intérieur d\'un AdminAuthProvider');
  }
  return context;
};