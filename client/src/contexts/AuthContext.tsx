import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import GlobalPasswordScreen from '@/components/auth/GlobalPasswordScreen';

interface AuthContextType {
  isAuthenticated: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('appAuthenticated') === 'true';
      const timestamp = Number(localStorage.getItem('authTimestamp') || '0');
      const currentTime = Date.now();
      
      // Session expire après 24 heures
      const isExpired = currentTime - timestamp > 24 * 60 * 60 * 1000;
      
      if (authenticated && !isExpired) {
        setIsAuthenticated(true);
      } else {
        // Nettoyer si expiré
        localStorage.removeItem('appAuthenticated');
        localStorage.removeItem('authTimestamp');
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const logout = () => {
    localStorage.removeItem('appAuthenticated');
    localStorage.removeItem('authTimestamp');
    setIsAuthenticated(false);
  };

  const handleAuthentication = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4">Chargement...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {!isAuthenticated ? (
        <GlobalPasswordScreen onAuthenticate={handleAuthentication} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}