import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';

// Types pour l'utilisateur admin
interface AdminUser {
  id: number;
  username: string;
  role: "admin" | "superadmin";
}

// Interface du contexte d'authentification admin
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

// Création du contexte avec une valeur par défaut (null)
const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

// Hook pour utiliser le contexte
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

// Définir le provider
export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier l'état d'authentification lors du montage du composant
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/auth-status');
      
      if (response.data.isAuthenticated) {
        setUser({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.isSuperAdmin ? "superadmin" : "admin"
        });
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      setUser(null);
      setError('Erreur lors de la vérification du statut d\'authentification');
      console.error('Erreur lors de la vérification du statut d\'authentification:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction de connexion
  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      setUser({
        id: response.data.id,
        username: response.data.username,
        role: response.data.role
      });
      return true;
    } catch (err: any) {
      setUser(null);
      const errorMessage = err.response?.data || 'Échec de la connexion';
      setError(errorMessage);
      return false;
    }
  };
  
  // Fonction de déconnexion
  const logout = async (): Promise<boolean> => {
    try {
      await axios.post('/api/admin/logout');
      setUser(null);
      setError(null);
      return true;
    } catch (err) {
      setError('Erreur lors de la déconnexion');
      console.error('Erreur lors de la déconnexion:', err);
      return false;
    }
  };
  
  const value: AdminAuthContextType = {
    user,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "superadmin",
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

export default AdminAuthContext;