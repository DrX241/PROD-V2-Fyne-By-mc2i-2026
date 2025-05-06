import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AdminUser {
  id: number;
  username: string;
  role?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier le statut d'authentification au chargement
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/admin/auth-status', {
        withCredentials: true // Assure que les cookies sont envoyés
      });
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setIsSuperAdmin(response.data.isSuperAdmin || false);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      }
      setError(null);
    } catch (err: any) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', err);
      setUser(null);
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await axios.post('/api/system/authenticate-super-admin', { username, password }, {
        withCredentials: true // Assure que les cookies sont envoyés et reçus
      });
      const { success, user, isSuperAdmin: superAdmin } = response.data;
      
      if (success) {
        setUser(user);
        setIsAuthenticated(true);
        setIsSuperAdmin(superAdmin || false);
        // Vérifie immédiatement si la session est bien établie
        await checkAuthStatus();
        return true;
      } else {
        setError(response.data.message || 'Échec de l\'authentification');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      console.error('Erreur lors de la connexion:', err);
      return false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      await axios.post('/api/system/logout-super-admin', {}, {
        withCredentials: true // Assure que les cookies sont envoyés
      });
      setUser(null);
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
      setError(null);
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la déconnexion:', err);
      setError('Erreur lors de la déconnexion');
      return false;
    }
  };

  const value: AdminAuthContextType = {
    user,
    isAuthenticated,
    isSuperAdmin,
    isLoading,
    error,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;